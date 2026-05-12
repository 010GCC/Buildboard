type LogoProps = { size?: number; className?: string; withWordmark?: boolean };

// Geometric monogram: a stacked B from two interlocking arcs + a precise dot.
export function Logo({ size = 28, className, withWordmark = false }: LogoProps) {
  return (
    <div className={"flex items-center gap-2 " + (className ?? "")} data-testid="logo-buildboard">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-label="Buildboard logo"
        role="img"
      >
        <rect x="1.5" y="1.5" width="29" height="29" rx="6.5" stroke="currentColor" strokeOpacity="0.18" />
        <path
          d="M9 8.5h7.2a4.3 4.3 0 0 1 0 8.6H9V8.5Zm0 8.6h8.4a4.3 4.3 0 0 1 0 8.6H9v-8.6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="23.5" cy="22" r="2" fill="hsl(var(--primary))" />
      </svg>
      {withWordmark && (
        <span className="font-sans font-semibold tracking-tight text-[15px]">Buildboard</span>
      )}
    </div>
  );
}
