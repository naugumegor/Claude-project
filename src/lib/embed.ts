/** Hosted 3D models we can embed as they are: Sketchfab and Tinkercad. */
export function embedUrl(src: string): string | null {
  const sketchfab = src.match(/sketchfab\.com\/(?:3d-models\/[^/?#]*-|models\/)([0-9a-f]{32})/i);
  if (sketchfab) return `https://sketchfab.com/models/${sketchfab[1]}/embed?ui_theme=dark&dnt=1`;
  const tinkercad = src.match(/tinkercad\.com\/(?:things|embed)\/([A-Za-z0-9]+)/);
  if (tinkercad) return `https://www.tinkercad.com/embed/${tinkercad[1]}?editbtn=1`;
  return null;
}

/**
 * A ```3d block: a model link alone, or "src:" plus an optional "title:".
 *
 *   ```3d
 *   src: https://…/gearbox.glb
 *   title: Редуктор в сборке
 *   ```
 */
export function parseModelBlock(raw: string) {
  let src = "";
  let title = "";
  for (const line of raw.split("\n").map((l) => l.trim())) {
    const field = line.match(/^(src|url|title)\s*:\s*(.+)$/i);
    if (field) {
      if (field[1].toLowerCase() === "title") title = field[2].trim();
      else src = field[2].trim();
    } else if (/^(https?:\/\/|\/)\S+$/.test(line)) src = line;
  }
  return /^(https:\/\/|\/)/.test(src) ? { src, title } : null;
}

/** A YouTube watch, short or youtu.be link → its 11-character video id. */
export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/**
 * A ```video block: one YouTube link per line, optionally followed by " | title".
 *
 *   ```video
 *   https://www.youtube.com/watch?v=aTpZqCwSjas | First angle projection
 *   ```
 */
export function parseVideoBlock(raw: string) {
  const videos: { id: string; title: string }[] = [];
  for (const line of raw.split("\n").map((l) => l.trim()).filter(Boolean)) {
    const [url, ...rest] = line.split("|");
    const id = youtubeId(url.trim());
    if (id) videos.push({ id, title: rest.join("|").trim() });
  }
  return videos;
}
