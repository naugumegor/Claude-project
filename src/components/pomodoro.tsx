"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CloudRain, Pause, Play, RotateCcw, Timer, Volume2, VolumeX, Waves, Wind, X } from "lucide-react";
import type { Dictionary } from "@/dictionaries";

type Labels = Dictionary["pomodoro"];
type Mode = "focus" | "rest";
type Sound = "silence" | "rain" | "white" | "brown";

const DURATION: Record<Mode, number> = { focus: 25 * 60, rest: 5 * 60 };
const STORE = "ingenium:pomodoro";

type Saved = { mode: Mode; running: boolean; endsAt: number; left: number };

/** Floating focus timer (25/5) with generated background noise. Lives in the layout, so it survives navigation. */
export function Pomodoro({ labels }: { labels: Labels }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("focus");
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(DURATION.focus);
  const endsAt = useRef(0);
  const [sound, setSound] = useState<Sound>("silence");
  const [volume, setVolume] = useState(0.5);
  const noise = useNoise(sound, volume);

  // Restore a timer that was running before a reload.
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) ?? "null") as Saved | null;
      if (!s) return;
      /* eslint-disable react-hooks/set-state-in-effect -- localStorage is only readable after mount */
      setMode(s.mode);
      if (s.running && s.endsAt > Date.now()) {
        endsAt.current = s.endsAt;
        setRunning(true);
        setLeft(Math.round((s.endsAt - Date.now()) / 1000));
      } else if (!s.running) {
        setLeft(s.left);
      }
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ mode, running, endsAt: endsAt.current, left } satisfies Saved));
    } catch {}
  }, [mode, running, left]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        chime();
        const next: Mode = mode === "focus" ? "rest" : "focus";
        setMode(next);
        setRunning(false);
        setLeft(DURATION[next]);
        setOpen(true);
      }
    };
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [running, mode]);

  // The countdown in the tab title, so it's visible from other tabs.
  useEffect(() => {
    if (!running) return;
    const original = document.title;
    document.title = `${format(left)} · ${mode === "focus" ? labels.focus : labels.rest}`;
    return () => {
      document.title = original;
    };
  }, [running, left, mode, labels]);

  const start = () => {
    endsAt.current = Date.now() + left * 1000;
    setRunning(true);
    noise.unlock();
  };
  const pause = () => setRunning(false);
  const reset = (m: Mode = mode) => {
    setRunning(false);
    setMode(m);
    setLeft(DURATION[m]);
  };

  const progress = 1 - left / DURATION[mode];
  const R = 52;
  const C = 2 * Math.PI * R;
  const tone = mode === "focus" ? "var(--rose)" : "var(--accent)";

  return (
    <div className="no-print fixed bottom-4 left-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="mb-3 w-72 origin-bottom-left rounded-3xl border border-line bg-surface/95 p-4 shadow-[0_30px_70px_-30px_rgba(35,38,43,0.55)] backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-bold">{labels.title}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="×" className="rounded-lg p-1 text-muted hover:text-ink">
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
              {(["focus", "rest"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => reset(m)}
                  className={`relative rounded-lg py-1.5 text-sm font-medium transition-colors ${mode === m ? "text-ink" : "text-muted hover:text-ink"}`}
                >
                  {mode === m && <motion.span layoutId="pomo-mode" className="absolute inset-0 rounded-lg bg-surface shadow-sm" />}
                  <span className="relative">
                    {m === "focus" ? labels.focus : labels.rest} · {DURATION[m] / 60}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative mx-auto my-4 size-36">
              <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                <circle cx="60" cy="60" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
                <motion.circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke={tone}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  animate={{ strokeDashoffset: C * (1 - progress) }}
                  transition={{ ease: "linear", duration: 0.5 }}
                />
              </svg>
              <span className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-extrabold tabular-nums">{format(left)}</span>
                <span className="text-xs text-muted">{mode === "focus" ? labels.focus : labels.rest}</span>
              </span>
            </div>

            <div className="flex justify-center gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={running ? pause : start}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_currentColor]"
                style={{ background: tone }}
              >
                {running ? <Pause size={16} /> : <Play size={16} />}
                {running ? labels.pause : labels.start}
              </motion.button>
              <button
                type="button"
                onClick={() => reset()}
                aria-label={labels.reset}
                className="rounded-xl border border-line px-3 text-muted transition-colors hover:text-ink"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="mt-4 border-t border-line pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{labels.sound}</p>
              <div className="grid grid-cols-4 gap-1">
                {(
                  [
                    ["silence", VolumeX, labels.silence],
                    ["rain", CloudRain, labels.rain],
                    ["white", Wind, labels.white],
                    ["brown", Waves, labels.brown],
                  ] as const
                ).map(([s, Icon, label]) => (
                  <button
                    key={s}
                    type="button"
                    title={label}
                    onClick={() => {
                      noise.unlock();
                      setSound(s);
                    }}
                    className={`group flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] transition-colors ${
                      sound === s ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-ink"
                    }`}
                  >
                    <Icon size={18} className="transition-transform group-hover:scale-110" />
                    <span className="max-w-full truncate px-1">{label}</span>
                  </button>
                ))}
              </div>
              {sound !== "silence" && (
                <label className="mt-2 flex items-center gap-2 text-muted">
                  <Volume2 size={14} />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-[var(--accent)]"
                  />
                </label>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={labels.title}
        className="group flex h-12 items-center gap-2 rounded-2xl border border-line bg-surface/90 px-3.5 shadow-[0_14px_34px_-18px_rgba(35,38,43,0.6)] backdrop-blur"
      >
        <motion.span
          animate={running ? { rotate: [0, -10, 10, 0] } : { rotate: 0 }}
          transition={{ duration: 0.6, repeat: running ? Infinity : 0, repeatDelay: 2 }}
          style={{ color: running ? tone : undefined }}
          className={running ? "" : "text-muted transition-colors group-hover:text-rose"}
        >
          <Timer size={20} />
        </motion.span>
        {running && <span className="font-display text-sm font-bold tabular-nums">{format(left)}</span>}
      </motion.button>
    </div>
  );
}

function format(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Two soft notes when a period ends. */
function chime() {
  try {
    const ctx = new AudioContext();
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + i * 0.25 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.25 + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + 0.7);
    });
  } catch {}
}

/** Background noise synthesised with Web Audio, so there are no audio files to host. */
function useNoise(sound: Sound, volume: number) {
  const ctx = useRef<AudioContext | null>(null);
  const out = useRef<GainNode | null>(null);

  const unlock = () => {
    // Browsers only allow audio after a click, so the context is created here.
    if (!ctx.current) {
      ctx.current = new AudioContext();
      out.current = ctx.current.createGain();
      out.current.gain.value = volume * 0.6;
      out.current.connect(ctx.current.destination);
    }
    void ctx.current.resume();
  };

  useEffect(() => {
    if (out.current && ctx.current) out.current.gain.setTargetAtTime(volume * 0.6, ctx.current.currentTime, 0.1);
  }, [volume]);

  useEffect(() => {
    const ac = ctx.current;
    const dest = out.current;
    if (!ac || !dest || sound === "silence") return;

    const buffer = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise is integrated white noise; rain starts from the same rumble.
      last = (last + 0.02 * white) / 1.02;
      data[i] = sound === "white" ? white * 0.35 : last * 3.5;
    }
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const nodes: AudioNode[] = [src];
    if (sound === "rain") {
      // Rain: brighter band-limited noise whose loudness drifts slowly.
      const white = ac.createBufferSource();
      const wb = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate);
      wb.getChannelData(0).forEach((_, i, arr) => (arr[i] = (Math.random() * 2 - 1) * 0.5));
      white.buffer = wb;
      white.loop = true;
      const band = ac.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 1800;
      band.Q.value = 0.6;
      const drift = ac.createGain();
      const lfo = ac.createOscillator();
      const depth = ac.createGain();
      lfo.frequency.value = 0.15;
      depth.gain.value = 0.25;
      drift.gain.value = 0.7;
      lfo.connect(depth).connect(drift.gain);
      white.connect(band).connect(drift).connect(dest);
      white.start();
      lfo.start();
      nodes.push(white, lfo);
    }
    src.connect(dest);
    src.start();
    return () => nodes.forEach((n) => (n as AudioScheduledSourceNode).stop());
  }, [sound]);

  return { unlock };
}
