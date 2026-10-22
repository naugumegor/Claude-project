import { useEffect, useRef, useState } from "react";

/**
 * useState that is saved to localStorage under `key` (null: not saved). The first render uses
 * `initial`, so the server HTML matches; the saved value replaces it right after mount.
 */
export function useStored<T>(key: string | null, initial: T) {
  const [value, setValue] = useState(initial);
  const loaded = useRef(false);

  useEffect(() => {
    if (!key) return;
    try {
      const saved = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
      if (saved !== null) setValue(JSON.parse(saved) as T);
    } catch {}
    loaded.current = true;
  }, [key]);

  useEffect(() => {
    if (!key || !loaded.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  const clear = () => {
    if (key) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
    setValue(initial);
  };

  return [value, setValue, clear] as const;
}

/** A short stable hash for building storage keys from block contents. */
export function hashKey(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
