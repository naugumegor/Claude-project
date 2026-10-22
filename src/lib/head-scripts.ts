// Tiny scripts inlined in <head> that run before paint. They live in a plain module (not a
// "use client" one) so the server layout gets the strings themselves, not client references.

export const THEME_KEY = "ingenium:theme";

/** A dark-theme reader never sees a light flash. */
export const themeScript = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

// The reader's profile (Общий / Инженерия / Бизнес) lives in localStorage and on
// <html data-profile>, so hidden sections never flash. CSS hides anything with a data-for
// that doesn't list the profile.

export const PROFILE_KEY = "ingenium:profile";

export const profileScript = `try{var p=localStorage.getItem("${PROFILE_KEY}");if(p==="engineering"||p==="business")document.documentElement.dataset.profile=p}catch(e){}`;
