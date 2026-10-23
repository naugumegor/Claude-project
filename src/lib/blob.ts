import "server-only";
import { head } from "@vercel/blob";

// Every Vercel Blob store has its own public host, "<store id>.public.blob.vercel-storage.com".
// URLs that come from the browser are only trusted when they point into OUR store: anybody can
// create a free store of their own and lay out the same folders in it.

/** Our store's public host, read from the token ("vercel_blob_rw_<storeId>_<secret>"). */
function ownHost() {
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.split("_")[3];
  return storeId ? `${storeId.toLowerCase()}.public.blob.vercel-storage.com` : null;
}

/** True when `url` is a file in our store under `folder` (e.g. "documents/"). */
export function isOwnBlob(url: string, folder: string) {
  const host = ownHost();
  if (!host) return false;
  try {
    const u = new URL(url);
    // URL parsing resolves "..", so the folder check can't be walked out of.
    return u.protocol === "https:" && u.host === host && u.pathname.startsWith(`/${folder}`);
  } catch {
    return false;
  }
}

/** The stored file's real size and type; the browser's own numbers are not to be trusted. */
export async function blobInfo(url: string) {
  try {
    const { size, contentType } = await head(url);
    return { size, contentType };
  } catch {
    return null;
  }
}
