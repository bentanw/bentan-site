// macOS Tahoe-style app icons: a continuous-corner squircle with a soft top sheen and a bright
// glass rim, so they read as "layered glass" in the Dock and as favicons in Safari tabs.

type IconProps = { className?: string };

// Superellipse-ish squircle on a 64-unit grid (closer to Apple's continuous corners than an rx rect).
const SQUIRCLE =
  "M32 1c19.5 0 25.4 0 28.2 2.8C63 6.6 63 12.5 63 32s0 25.4-2.8 28.2C57.4 63 51.5 63 32 63s-25.4 0-28.2-2.8C1 57.4 1 51.5 1 32S1 6.6 3.8 3.8C6.6 1 12.5 1 32 1z";

function Squircle({
  id,
  from,
  to,
  children,
  className,
}: IconProps & { id: string; from: string; to: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={SQUIRCLE} />
        </clipPath>
      </defs>
      <path d={SQUIRCLE} fill={`url(#${id}-bg)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <ellipse cx="32" cy="2" rx="44" ry="30" fill={`url(#${id}-sheen)`} />
        {children}
      </g>
      <path d={SQUIRCLE} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" />
    </svg>
  );
}

export function MacHomeIcon({ className }: IconProps) {
  return (
    <Squircle id="mi-home" from="#5ac8fa" to="#0a5bff" className={className}>
      <path
        d="M32 15 13 31h5.5v17.5a1.5 1.5 0 0 0 1.5 1.5h8.5V38.5h7V50H44a1.5 1.5 0 0 0 1.5-1.5V31H51z"
        fill="#fff"
        fillOpacity="0.95"
      />
      <path d="M32 15 13 31h5.5L32 19.6 45.5 31H51z" fill="#fff" />
    </Squircle>
  );
}

export function MacResumeIcon({ className }: IconProps) {
  return (
    <Squircle id="mi-cv" from="#ffffff" to="#dfe3ea" className={className}>
      <path
        d="M20 12h17l9 9v29.5a1.5 1.5 0 0 1-1.5 1.5h-24a1.5 1.5 0 0 1-1.5-1.5v-37A1.5 1.5 0 0 1 20 12z"
        fill="#fff"
        stroke="#c4cad4"
        strokeWidth="1"
      />
      <path
        d="M37 12v7.5a1.5 1.5 0 0 0 1.5 1.5H46"
        fill="#eef1f5"
        stroke="#c4cad4"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <rect x="23" y="17" width="10" height="2.6" rx="1.3" fill="#ff3b30" />
      <path d="M23 26h18M23 31h18M23 36h18M23 41h12" stroke="#9aa3b2" strokeWidth="2" strokeLinecap="round" />
    </Squircle>
  );
}

export function MacContactIcon({ className }: IconProps) {
  return (
    <Squircle id="mi-mail" from="#4cd964" to="#0a9a3d" className={className}>
      <rect x="13" y="19" width="38" height="27" rx="4" fill="#fff" />
      <path
        d="M14.5 21.5 32 35l17.5-13.5"
        fill="none"
        stroke="#0f9d44"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Squircle>
  );
}
