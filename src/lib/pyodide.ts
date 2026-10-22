// Runs Python in the browser with Pyodide, inside a Web Worker so a long loop never freezes
// the page. One worker serves every ```python block on the page; "Stop" kills it and the next
// run starts a fresh one. Pyodide itself (~10 MB) loads from the CDN on the first run only.

export const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.29.4/full/";

export type RunEvent =
  | { kind: "status"; text: string }
  | { kind: "out" | "err"; text: string }
  | { kind: "result"; text: string }
  | { kind: "image"; png: string }
  | { kind: "done"; ok: boolean };

const WORKER = `
importScripts(${JSON.stringify(PYODIDE_URL)} + "pyodide.js");
const ready = loadPyodide({ indexURL: ${JSON.stringify(PYODIDE_URL)}, env: { MPLBACKEND: "Agg" } });
self.postMessage({ boot: true });

const FIGURES = \`
import sys
_png = []
if "matplotlib.pyplot" in sys.modules:
    import io, base64
    _plt = sys.modules["matplotlib.pyplot"]
    for _n in _plt.get_fignums():
        _buf = io.BytesIO()
        _plt.figure(_n).savefig(_buf, format="png", dpi=110, bbox_inches="tight")
        _png.append(base64.b64encode(_buf.getvalue()).decode())
    _plt.close("all")
_png
\`;

self.onmessage = async (e) => {
  const { id, code } = e.data;
  const send = (msg) => self.postMessage({ id, ...msg });
  let py;
  try {
    py = await ready;
  } catch (err) {
    send({ kind: "err", text: String(err) });
    return send({ kind: "done", ok: false });
  }
  py.setStdout({ batched: (text) => send({ kind: "out", text }) });
  py.setStderr({ batched: (text) => send({ kind: "err", text }) });
  const scope = py.globals.get("dict")();
  let ok = true;
  try {
    await py.loadPackagesFromImports(code, {
      messageCallback: (text) => send({ kind: "status", text }),
      errorCallback: (text) => send({ kind: "err", text }),
    });
    const result = await py.runPythonAsync(code, { globals: scope });
    if (result !== undefined && result !== null) {
      const repr = py.globals.get("repr");
      send({ kind: "result", text: repr(result) });
      if (result.destroy) result.destroy();
    }
  } catch (err) {
    ok = false;
    send({ kind: "err", text: cleanTraceback(String(err.message ?? err)) });
  }
  try {
    const images = await py.runPythonAsync(FIGURES, { globals: scope });
    for (const png of images.toJs()) send({ kind: "image", png });
    images.destroy();
  } catch {}
  scope.destroy();
  send({ kind: "done", ok });
};

// Drop Pyodide's own frames: the student only cares about lines of their code.
function cleanTraceback(text) {
  const lines = text.split("\\n");
  const start = lines.findIndex((l) => l.includes('File "<exec>"'));
  return start > 0 ? ["Traceback (most recent call last):", ...lines.slice(start)].join("\\n") : text;
}
`;

let worker: Worker | null = null;
let booted = false;
let nextId = 1;
const listeners = new Map<number, (e: RunEvent) => void>();

function getWorker() {
  if (worker) return worker;
  const url = URL.createObjectURL(new Blob([WORKER], { type: "text/javascript" }));
  worker = new Worker(url);
  URL.revokeObjectURL(url);
  worker.onmessage = (e: MessageEvent) => {
    if (e.data.boot) return;
    listeners.get(e.data.id)?.(e.data as RunEvent);
  };
  worker.onerror = (e) => {
    for (const [, fn] of listeners) {
      fn({ kind: "err", text: e.message || "Python failed to load" });
      fn({ kind: "done", ok: false });
    }
    stopPython();
  };
  return worker;
}

/** Runs a snippet; events stream to onEvent until a "done" event. */
export function runPython(code: string, onEvent: (e: RunEvent) => void) {
  const id = nextId++;
  const firstRun = !booted;
  booted = true;
  listeners.set(id, (e) => {
    onEvent(e);
    if (e.kind === "done") listeners.delete(id);
  });
  if (firstRun) onEvent({ kind: "status", text: "boot" });
  getWorker().postMessage({ id, code });
  return id;
}

/** Kills the worker (an endless loop, say). Pending runs end as failed. */
export function stopPython() {
  worker?.terminate();
  worker = null;
  booted = false;
  for (const [, fn] of listeners) fn({ kind: "done", ok: false });
  listeners.clear();
}
