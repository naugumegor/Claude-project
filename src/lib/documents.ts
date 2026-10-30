// File kinds a material can carry next to its text: PDFs, HTML pages, .glb 3D models and photos.

export const DOCUMENT_KINDS = {
  pdf: { ext: "pdf", type: "application/pdf" },
  html: { ext: "html", type: "text/html" },
  model: { ext: "glb", type: "model/gltf-binary" },
  // Photos come in several formats (IMAGE_TYPES); this is the fallback.
  image: { ext: "jpg", type: "image/jpeg" },
} as const;

export type DocumentKind = keyof typeof DOCUMENT_KINDS;

/**
 * Photo formats we store and show as they are. HEIC/HEIF (iPhone) is turned into JPEG in the
 * browser before upload (src/lib/heic.ts), since only Safari can display it. No SVG: it can
 * carry scripts.
 */
export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
} as const;

export type ImageType = keyof typeof IMAGE_TYPES;

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;
export const HEIC_FILE = /\.(heic|heif)$/i;

export const DOCUMENT_ACCEPT =
  ".pdf,.html,.htm,.glb,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.heif,application/pdf,text/html,model/gltf-binary,image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif";

/** Every content type an upload may have. */
export const UPLOAD_TYPES = [
  ...new Set([...Object.values(DOCUMENT_KINDS).map((k) => k.type), ...Object.keys(IMAGE_TYPES)]),
];

/** Strips a known file extension, for a default document name. */
export const stripExt = (name: string) =>
  name.replace(/\.(pdf|html?|glb|jpe?g|png|webp|gif|avif|heic|heif)$/i, "");

export function isHeic(file: { type: string; name: string }) {
  return /^image\/hei[cf]/.test(file.type) || HEIC_FILE.test(file.name);
}

export function documentKind(file: { type: string; name: string }): DocumentKind | null {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "pdf";
  if (file.type === "text/html" || /\.html?$/i.test(file.name)) return "html";
  if (file.type === "model/gltf-binary" || /\.glb$/i.test(file.name)) return "model";
  if (file.type in IMAGE_TYPES || IMAGE_EXT.test(file.name) || isHeic(file)) return "image";
  return null;
}

export function isDocumentKind(value: unknown): value is DocumentKind {
  return typeof value === "string" && value in DOCUMENT_KINDS;
}

/** The type and extension to store a picked file under (after any HEIC conversion). */
export function fileFormat(kind: DocumentKind, file: { type: string; name: string }) {
  if (kind !== "image") return DOCUMENT_KINDS[kind];
  if (file.type in IMAGE_TYPES) return { type: file.type, ext: IMAGE_TYPES[file.type as ImageType] };
  const ext = file.name.match(IMAGE_EXT)?.[1].toLowerCase();
  const type = Object.entries(IMAGE_TYPES).find(([, e]) => e === (ext === "jpeg" ? "jpg" : ext))?.[0];
  return type ? { type, ext: IMAGE_TYPES[type as ImageType] } : DOCUMENT_KINDS.image;
}

/** The type a stored file is served with: photos by the extension of their stored URL. */
export function storedFormat(kind: DocumentKind, url: string) {
  return fileFormat(kind, { type: "", name: url.split("?")[0] });
}

/** Whether a stored content type fits the kind the browser claimed. */
export function typeFitsKind(kind: DocumentKind, contentType: string) {
  const type = contentType.split(";")[0].trim();
  return kind === "image" ? type in IMAGE_TYPES : type === DOCUMENT_KINDS[kind].type;
}

/** Short badge for a kind, as shown next to a document. */
export function kindLabel(kind: DocumentKind, locale: string) {
  if (kind === "model") return "3D";
  if (kind === "image") return locale === "ru" ? "Фото" : "Photo";
  return kind.toUpperCase();
}
