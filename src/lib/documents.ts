// File kinds a material can carry next to its text: PDFs, HTML pages and .glb 3D models.

export const DOCUMENT_KINDS = {
  pdf: { ext: "pdf", type: "application/pdf" },
  html: { ext: "html", type: "text/html" },
  model: { ext: "glb", type: "model/gltf-binary" },
} as const;

export type DocumentKind = keyof typeof DOCUMENT_KINDS;

export const DOCUMENT_ACCEPT = ".pdf,.html,.htm,.glb,application/pdf,text/html,model/gltf-binary";

export function documentKind(file: { type: string; name: string }): DocumentKind | null {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "pdf";
  if (file.type === "text/html" || /\.html?$/i.test(file.name)) return "html";
  if (file.type === "model/gltf-binary" || /\.glb$/i.test(file.name)) return "model";
  return null;
}

export function isDocumentKind(value: unknown): value is DocumentKind {
  return typeof value === "string" && value in DOCUMENT_KINDS;
}
