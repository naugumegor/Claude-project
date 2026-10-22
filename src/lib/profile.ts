"use client";

import { useSyncExternalStore } from "react";
import { PROFILES, type ProfileChoice } from "@/lib/taxonomy";
import { PROFILE_KEY } from "@/lib/head-scripts";

// The reader's profile switch in the browser; see head-scripts.ts for how it is stored.

const EVENT = "ingenium:profile";

function read(): ProfileChoice {
  const p = document.documentElement.dataset.profile;
  return PROFILES.includes(p as ProfileChoice) ? (p as ProfileChoice) : "general";
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function useProfile(): ProfileChoice {
  return useSyncExternalStore(subscribe, read, () => "general");
}

export function setProfile(next: ProfileChoice) {
  if (next === "general") delete document.documentElement.dataset.profile;
  else document.documentElement.dataset.profile = next;
  try {
    localStorage.setItem(PROFILE_KEY, next);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}
