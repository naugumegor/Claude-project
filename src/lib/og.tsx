import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

// Manrope with Cyrillic so Russian titles render; read once per server instance.
const fonts = Promise.all(
  ([500, 800] as const).map(async (weight) => ({
    name: "Manrope",
    weight,
    style: "normal" as const,
    data: await readFile(join(process.cwd(), "assets/fonts", `Manrope-${weight}.ttf`)),
  })),
);

const tone = { note: "#2f7d6d", link: "#c98a3d", photo: "#b5546b", doc: "#7a62a8" } as const;

/** The shared social preview card: paper background, logo, badge, big title. */
export async function renderOg({
  title,
  subtitle,
  badge,
  type,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  type?: keyof typeof tone;
}) {
  const accent = type ? tone[type] : "#2f7d6d";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          fontFamily: "Manrope",
          color: "#23262b",
          background: "#f7f4ee",
          position: "relative",
        }}
      >
        {/* Soft colour blobs in the corners, like the site background. */}
        <div style={{ position: "absolute", top: -260, left: -200, width: 640, height: 640, borderRadius: 320, background: "#e3f0ec", display: "flex" }} />
        <div style={{ position: "absolute", top: -220, right: -180, width: 560, height: 560, borderRadius: 280, background: "#f6ebdc", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#2f7d6d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 9, background: "#c98a3d" }} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>Ingenium</div>
          {badge && (
            <div
              style={{
                marginLeft: 12,
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 24,
                fontWeight: 800,
                color: accent,
                background: `${accent}22`,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {badge}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: title.length > 60 ? 60 : 76,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -2,
              display: "flex",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 30, fontWeight: 500, color: "#6b6f76", lineHeight: 1.4, display: "flex" }}>
              {subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}
            </div>
          )}
        </div>
        <div style={{ height: 10, width: 180, borderRadius: 5, background: accent, display: "flex" }} />
      </div>
    ),
    { ...ogSize, fonts: await fonts },
  );
}
