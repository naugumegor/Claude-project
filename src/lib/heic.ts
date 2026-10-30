import { isHeic, stripExt } from "@/lib/documents";

/**
 * iPhone photos (HEIC/HEIF) only display in Safari, so they are turned into JPEG in the browser
 * before upload. The decoder (libheif in WebAssembly, ~3 MB) loads only when such a file shows up.
 * Any other file comes back untouched.
 */
export async function normalizeUpload(file: File): Promise<File> {
  if (!isHeic(file)) return file;
  const { heicTo } = await import("heic-to/csp");
  const jpeg = await heicTo({ blob: file, type: "image/jpeg", quality: 0.9 });
  return new File([jpeg], `${stripExt(file.name)}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
}
