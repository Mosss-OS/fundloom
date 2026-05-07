/**
 * Devfolio-inspired decorative SVG primitives.
 * Hand-drawn half-moons, sunburst, dots, and blobs scattered behind sections.
 * All shapes use design tokens via currentColor where possible.
 */

export function SmileMoon({
  className = "",
  color = "#F4C26B",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 80 50" className={className} aria-hidden>
      <path d="M2 6 C 2 30, 30 48, 40 48 C 50 48, 78 30, 78 6 Z" fill={color} />
      <circle cx="28" cy="22" r="2.4" fill="#1a1a1a" />
      <circle cx="52" cy="22" r="2.4" fill="#1a1a1a" />
      <path
        d="M30 32 Q 40 40 50 32"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sunburst({
  className = "",
  color = "#E8E4D5",
}: {
  className?: string;
  color?: string;
}) {
  // 12-point soft star
  const points = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * Math.PI) / 12;
    const r = i % 2 === 0 ? 50 : 36;
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <polygon points={points} fill={color} />
    </svg>
  );
}

export function Blob({
  className = "",
  color = "#9CA8FF",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <path
        d="M30 4 C 48 4, 58 18, 56 34 C 54 50, 38 58, 24 54 C 10 50, 2 36, 6 22 C 9 12, 18 4, 30 4 Z"
        fill={color}
      />
    </svg>
  );
}

export function Dot({ className = "", color = "#5b8cff" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <circle cx="10" cy="10" r="9" fill={color} />
    </svg>
  );
}

/** Green hand-drawn underline accent (Devfolio's signature treatment). */
export function Underline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none" className={className} aria-hidden>
      <path
        d="M2 9 C 40 2, 90 2, 130 6 S 190 12, 198 6"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Floating decoration — subtle bobbing motion using plain CSS animation. */
export function Floater({
  children,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{
        animation: "floaterBob 6s ease-in-out infinite",
      }}
    >
      {children}
    </div>
  );
}
