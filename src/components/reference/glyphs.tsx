import type { GdtSymbol } from "@/lib/reference-data";

// GD&T and roughness symbols drawn as SVG: font support for ⏥ ⌭ ⌯ ⌰ is patchy, and these
// stay crisp in both themes because they draw with currentColor.

const GDT_PATHS: Record<string, React.ReactNode> = {
  straightness: <path d="M3 12H21" />,
  flatness: <path d="M3 17L8 7H21L16 17Z" />,
  roundness: <circle cx="12" cy="12" r="7.5" />,
  cylindricity: (
    <>
      <circle cx="12" cy="12" r="5.5" />
      <path d="M3.5 20L10 3.5M14 20.5L20.5 4" />
    </>
  ),
  "line-profile": <path d="M3.5 17A8.5 8.5 0 0 1 20.5 17" />,
  "surface-profile": <path d="M3.5 17A8.5 8.5 0 0 1 20.5 17Z" />,
  parallelism: <path d="M4 20L11 4M13 20L20 4" />,
  perpendicularity: <path d="M12 4V19M3 19H21" />,
  angularity: <path d="M3 19H21M3 19L18 6" />,
  position: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 2.5V21.5M2.5 12H21.5" />
    </>
  ),
  concentricity: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  symmetry: <path d="M3 12H21M7 7H17M7 17H17" />,
  runout: (
    <>
      <path d="M6 20L17 5" />
      <path d="M17 5L11.5 8.2M17 5L16.2 11.2" />
    </>
  ),
  "total-runout": (
    <>
      <path d="M3 20H14M3 20L12 6M10 20L19 6" />
      <path d="M12 6L7.5 8.6M12 6L11.6 11M19 6L14.5 8.6M19 6L18.6 11" />
    </>
  ),
};

export function GdtGlyph({ id, size = 28 }: { id: GdtSymbol["id"]; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {GDT_PATHS[id]}
    </svg>
  );
}

/** A feature control frame: | symbol | tolerance | datums |, as drawn on a drawing. */
export function ControlFrame({ id, value, datums = [] }: { id: string; value: string; datums?: string[] }) {
  return (
    <span className="inline-flex items-stretch border border-ink font-mono text-sm leading-none">
      <span className="flex items-center px-1.5 py-1">
        <GdtGlyph id={id} size={18} />
      </span>
      <span className="flex items-center border-l border-ink px-2">{value}</span>
      {datums.map((d) => (
        <span key={d} className="flex items-center border-l border-ink px-2 font-semibold">
          {d}
        </span>
      ))}
    </span>
  );
}

/** Roughness sign of ГОСТ 2.309-73 with an optional parameter on the shelf. */
export function RoughnessSign({
  kind,
  value,
  size = 44,
}: {
  kind: "any" | "removal" | "no-removal";
  value?: string;
  size?: number;
}) {
  // Proportions from the standard: the short leg at 60°, the long one about twice as tall.
  const width = value ? (size * 57) / 36 : (size * 22) / 30;
  return (
    <svg
      viewBox={value ? "0 0 57 36" : "0 6 22 30"}
      width={width}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={`M3 24L8 33L18 10${value ? "H55" : ""}`} />
      {kind === "removal" && <path d="M3 24H11.9" />}
      {kind === "no-removal" && <circle cx="8.1" cy="26.2" r="2.9" />}
      {value && (
        <text x="20" y="7.5" stroke="none" fill="currentColor" fontSize="8.5" className="font-mono">
          {value}
        </text>
      )}
    </svg>
  );
}
