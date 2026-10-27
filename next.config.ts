import type { NextConfig } from "next";

// Content Security Policy, for now in report-only mode: the browser logs what it would block
// (DevTools → Console) without breaking anything. Once the console stays quiet, switch the
// header name to "Content-Security-Policy".
const csp = [
  "default-src 'self'",
  // Next.js inline bootstrap scripts; Pyodide and sql.js from jsdelivr need WebAssembly.
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://cdn.jsdelivr.net https://*.public.blob.vercel-storage.com https://vercel.com https://vitals.vercel-insights.com",
  "frame-src 'self' https://sketchfab.com https://www.tinkercad.com",
  "media-src 'self' blob: https://*.public.blob.vercel-storage.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://github.com",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  // Nobody else may put the site (and above all the admin) in a frame: no clickjacking.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // PGlite (local dev database) loads its WASM from disk, so it must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Read from disk at runtime: fonts for the social preview images, and documents that ship with the code.
  outputFileTracingIncludes: { "/*": ["./assets/fonts/**"], "/api/files/*": ["./content/docs/*.html"] },
  images: {
    // Photos uploaded through the admin live in Vercel Blob.
    remotePatterns: [new URL("https://*.public.blob.vercel-storage.com/**")],
  },
  experimental: {
    // Photos are downscaled in the browser before upload, so 4 MB is plenty.
    serverActions: { bodySizeLimit: "4mb" },
    // Local builds read PGlite, which one process at a time may open; Neon (on Vercel) has no such limit.
    ...(!process.env.DATABASE_URL && { cpus: 1 }),
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
