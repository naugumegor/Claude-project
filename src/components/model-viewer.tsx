"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Box,
  Expand,
  Grid3x3,
  MousePointerClick,
  RotateCcw,
  Scissors,
  TriangleAlert,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type * as Three from "three";

// A small CAD-style viewer for .glb models: orbit, exploded view, section plane, wireframe
// and clickable parts. three.js (~150 KB gz) loads only when a viewer scrolls into view.

const text = {
  ru: {
    load: "Загружаю модель…",
    error: "Не удалось загрузить модель. Ссылка должна вести на .glb и разрешать загрузку с других сайтов (CORS).",
    explode: "Разнесённый вид",
    section: "Разрез",
    off: "нет",
    wire: "Каркас",
    reset: "Сбросить вид",
    full: "На весь экран",
    parts: "Детали",
    hint: "Крути мышью или пальцем, колесо или щипок для зума. Нажми на деталь, чтобы её выделить.",
  },
  en: {
    load: "Loading model…",
    error: "Couldn't load the model. The link must point to a .glb that allows cross-origin loading (CORS).",
    explode: "Exploded view",
    section: "Section",
    off: "off",
    wire: "Wireframe",
    reset: "Reset view",
    full: "Fullscreen",
    parts: "Parts",
    hint: "Drag to orbit, scroll or pinch to zoom. Click a part to highlight it.",
  },
};

type Axis = "x" | "y" | "z";
type Part = { id: number; name: string };
type Scene = {
  THREE: typeof Three;
  renderer: Three.WebGLRenderer;
  camera: Three.PerspectiveCamera;
  controls: { target: Three.Vector3; update: () => boolean; dispose: () => void };
  meshes: { mesh: Three.Mesh; base: Three.Vector3; offset: Three.Vector3; materials: Three.MeshStandardMaterial[] }[];
  half: Three.Vector3;
  plane: Three.Plane;
  home: Three.Vector3;
  invalidate: () => void;
};

export function ModelViewer({ src, title, locale }: { src: string; title?: string; locale: Locale }) {
  const t = text[locale];
  const wrap = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const scene = useRef<Scene | null>(null);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [parts, setParts] = useState<Part[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [explode, setExplode] = useState(0);
  const [axis, setAxis] = useState<Axis | null>(null);
  const [cut, setCut] = useState(0.5);
  const [wire, setWire] = useState(false);

  // Start loading when the viewer is about to scroll into view.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: "300px" });
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let disposed = false;
    let frame = 0;
    let teardown = () => {};
    const el = mount.current!;

    (async () => {
      setStatus("loading");
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.localClippingEnabled = true;
      el.appendChild(renderer.domElement);
      renderer.domElement.style.touchAction = "none";

      const world = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 1000);
      world.add(new THREE.HemisphereLight(0xffffff, 0x9aa0a8, 2));
      // A key light that follows the camera keeps every side readable while orbiting.
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(1, 2, 3);
      camera.add(key);
      world.add(camera);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      let gltf;
      try {
        gltf = await new GLTFLoader().loadAsync(src, (e) => e.total && setProgress(e.loaded / e.total));
      } catch {
        if (!disposed) setStatus("error");
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      if (disposed) return;

      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      model.position.sub(box.getCenter(new THREE.Vector3()));
      world.add(model);
      model.updateMatrixWorld(true);
      const half = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
      const radius = half.length() || 1;

      const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
      const meshes: Scene["meshes"] = [];
      const found: Part[] = [];
      model.traverse((o) => {
        const mesh = o as Three.Mesh;
        if (!mesh.isMesh) return;
        // Own material copies, so highlighting one part doesn't light up its twins.
        const list = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((m) => {
          const c = (m as Three.MeshStandardMaterial).clone();
          c.side = THREE.DoubleSide;
          c.userData.emissive = c.emissive?.clone();
          c.userData.emissiveIntensity = c.emissiveIntensity;
          return c;
        });
        mesh.material = Array.isArray(mesh.material) ? list : list[0];
        // Explode direction: from the model centre through the part's centre, in parent space.
        const centre = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
        const dir = centre.lengthSq() > 1e-9 * radius * radius ? centre.clone().normalize() : new THREE.Vector3(0, 1, 0);
        const target = centre.clone().addScaledVector(dir, radius * 0.5);
        const parent = mesh.parent!;
        const offset = parent.worldToLocal(target.clone()).sub(parent.worldToLocal(centre.clone()));
        meshes.push({ mesh, base: mesh.position.clone(), offset, materials: list as Three.MeshStandardMaterial[] });
        const name = mesh.name || mesh.parent?.name || `#${found.length + 1}`;
        found.push({ id: meshes.length - 1, name: name.replace(/_/g, " ") });
      });

      const home = new THREE.Vector3(radius * 1.5, radius * 1.1, radius * 2);
      camera.near = radius / 100;
      camera.far = radius * 100;
      camera.position.copy(home);
      camera.updateProjectionMatrix();
      controls.target.set(0, 0, 0);
      controls.update();

      // Render on demand: only while the camera moves (damping included) or a control changes,
      // so an idle model costs nothing.
      const tick = () => {
        frame = 0;
        const moving = controls.update();
        renderer.render(world, camera);
        if (moving) invalidate();
      };
      const invalidate = () => {
        if (!frame && !disposed) frame = requestAnimationFrame(tick);
      };

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = el;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        invalidate();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      // A click (not a drag) picks the part under the pointer.
      const ray = new THREE.Raycaster();
      let down: { x: number; y: number } | null = null;
      const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
      const onUp = (e: PointerEvent) => {
        if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
        const r = renderer.domElement.getBoundingClientRect();
        ray.setFromCamera(
          new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1),
          camera,
        );
        const hits = ray.intersectObjects(meshes.map((m) => m.mesh), false);
        // Skip hits on the cut-away side of the section plane.
        const clipped = Boolean(meshes[0]?.materials[0]?.clippingPlanes?.length);
        const hit = hits.find((h) => !clipped || plane.distanceToPoint(h.point) >= 0);
        setSelected(hit ? meshes.findIndex((m) => m.mesh === hit.object) : null);
      };
      renderer.domElement.addEventListener("pointerdown", onDown);
      renderer.domElement.addEventListener("pointerup", onUp);

      controls.addEventListener("change", invalidate);
      invalidate();

      scene.current = { THREE, renderer, camera, controls, meshes, half, plane, home, invalidate };
      setParts(found);
      setStatus("ready");

      teardown = () => {
        ro.disconnect();
        renderer.domElement.removeEventListener("pointerdown", onDown);
        renderer.domElement.removeEventListener("pointerup", onUp);
        controls.dispose();
        model.traverse((o) => {
          const mesh = o as Three.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) m.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      teardown();
      scene.current = null;
    };
  }, [visible, src]);

  // Exploded view.
  useEffect(() => {
    const s = scene.current;
    if (!s) return;
    for (const m of s.meshes) m.mesh.position.copy(m.base).addScaledVector(m.offset, explode);
    s.invalidate();
  }, [explode, status]);

  // Section plane along the chosen axis; `cut` runs from one side of the model to the other.
  useEffect(() => {
    if (scene.current) applySection(scene.current, axis, cut);
    scene.current?.invalidate();
  }, [axis, cut, status]);

  useEffect(() => {
    if (scene.current) applyWireframe(scene.current, wire);
    scene.current?.invalidate();
  }, [wire, status]);

  // Highlight the selected part with a soft accent glow.
  useEffect(() => {
    const s = scene.current;
    if (!s) return;
    const accent = new s.THREE.Color(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#2f7d6d");
    s.meshes.forEach((m, i) => {
      for (const mat of m.materials) {
        if (!mat.emissive) continue;
        mat.emissive.copy(i === selected ? accent : mat.userData.emissive);
        mat.emissiveIntensity = i === selected ? 0.55 : mat.userData.emissiveIntensity;
      }
    });
    s.invalidate();
  }, [selected, status]);

  const resetView = () => {
    const s = scene.current;
    if (!s) return;
    s.camera.position.copy(s.home);
    s.controls.target.set(0, 0, 0);
    s.invalidate();
    setExplode(0);
    setAxis(null);
    setSelected(null);
  };

  const selectedName = selected !== null ? parts.find((p) => p.id === selected)?.name : null;

  return (
    <figure ref={wrap} className="not-prose my-8 overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="relative h-[26rem] bg-[radial-gradient(circle_at_50%_40%,var(--surface)_0,var(--surface-2)_70%)] sm:h-[32rem]">
        <div ref={mount} className="absolute inset-0" />

        <AnimatePresence>
          {status !== "ready" && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted"
            >
              {status === "error" ? (
                <>
                  <TriangleAlert className="text-rose" />
                  <p className="max-w-sm">{t.error}</p>
                </>
              ) : (
                <>
                  <Box size={32} className="animate-pulse text-accent" />
                  <p>{t.load}</p>
                  <div className="h-1 w-40 overflow-hidden rounded-full bg-line">
                    <motion.div className="h-full bg-accent" animate={{ width: `${Math.round(progress * 100)}%` }} />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {status === "ready" && (
          <>
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              <ToolButton active={wire} onClick={() => setWire((w) => !w)} label={t.wire}>
                <Grid3x3 size={15} />
              </ToolButton>
              <ToolButton onClick={resetView} label={t.reset}>
                <RotateCcw size={15} />
              </ToolButton>
              <ToolButton
                onClick={() => (document.fullscreenElement ? document.exitFullscreen() : wrap.current?.requestFullscreen())}
                label={t.full}
              >
                <Expand size={15} />
              </ToolButton>
            </div>
            <AnimatePresence>
              {selectedName && (
                <motion.div
                  key={selectedName}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-3 top-3 flex max-w-[60%] items-center gap-1.5 rounded-xl border border-accent bg-surface/95 px-3 py-1.5 text-sm shadow-sm"
                >
                  <MousePointerClick size={14} className="shrink-0 text-accent" />
                  <span className="truncate">{selectedName}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {status === "ready" && (
        <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr_16rem]">
          <label className="block text-sm">
            <span className="flex items-center gap-1.5 text-muted">
              <Expand size={14} className="text-ochre" />
              {t.explode}
              <span className="ml-auto font-mono text-xs">{Math.round(explode * 100)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={explode}
              onChange={(e) => setExplode(Number(e.target.value))}
              className="calc-range mt-1.5 w-full"
            />
          </label>
          <div className="text-sm">
            <span className="flex items-center gap-1.5 text-muted">
              <Scissors size={14} className="text-rose" />
              {t.section}
              <span className="ml-auto flex gap-1">
                {([null, "x", "y", "z"] as const).map((a) => (
                  <button
                    key={a ?? "off"}
                    type="button"
                    onClick={() => setAxis(a)}
                    className={`rounded-md px-1.5 py-0.5 font-mono text-xs transition-colors ${
                      axis === a ? "bg-rose-soft text-rose" : "hover:bg-surface-2"
                    }`}
                  >
                    {a ? a.toUpperCase() : t.off}
                  </button>
                ))}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.005}
              value={cut}
              disabled={!axis}
              onChange={(e) => setCut(Number(e.target.value))}
              className="calc-range mt-1.5 w-full disabled:opacity-40"
            />
          </div>
          {parts.length > 1 && (
            <details className="text-sm sm:col-span-2 lg:col-span-1">
              <summary className="cursor-pointer text-muted">
                {t.parts} · {parts.length}
              </summary>
              <ul className="mt-2 max-h-40 overflow-auto">
                {parts.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(p.id === selected ? null : p.id)}
                      className={`w-full truncate rounded-md px-2 py-0.5 text-left text-xs transition-colors ${
                        p.id === selected ? "bg-accent-soft text-accent" : "hover:bg-surface-2"
                      }`}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <figcaption className="flex flex-wrap items-baseline gap-x-3 border-t border-line px-4 py-2 text-xs text-muted">
        {title && <span className="font-medium text-ink">{title}</span>}
        <span>{t.hint}</span>
      </figcaption>
    </figure>
  );
}

// three.js objects are mutable by design; these run from effects after a control changes.
function applySection(s: Scene, axis: Axis | null, cut: number) {
  const normal = new s.THREE.Vector3(axis === "x" ? -1 : 0, axis === "y" ? -1 : 0, axis === "z" ? -1 : 0);
  const extent = axis ? s.half[axis] : 0;
  s.plane.set(normal, -extent + cut * 2 * extent);
  for (const m of s.meshes) for (const mat of m.materials) mat.clippingPlanes = axis ? [s.plane] : [];
}

function applyWireframe(s: Scene, wire: boolean) {
  for (const m of s.meshes) for (const mat of m.materials) mat.wireframe = wire;
}

function ToolButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`flex size-8 items-center justify-center rounded-lg border backdrop-blur transition-all hover:scale-105 ${
        active ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface/80 text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
