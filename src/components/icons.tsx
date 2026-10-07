// Windows 11 (Fluent) style icons. Gradient ids are shared between instances, which is fine because
// the definitions are identical wherever an icon is rendered.

type IconProps = { className?: string };

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fi-home-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fd0ff" />
          <stop offset="1" stopColor="#2b8de8" />
        </linearGradient>
        <linearGradient id="fi-home-roof" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3aa6ff" />
          <stop offset="1" stopColor="#0a4fc4" />
        </linearGradient>
      </defs>
      <path d="M9 21.5 24 9l15 12.5V39a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3z" fill="url(#fi-home-wall)" />
      <path
        d="M4.6 22.6 22.1 7.7a3 3 0 0 1 3.8 0l17.5 14.9a1.8 1.8 0 0 1-2.4 2.7L24 10.9 7 25.3a1.8 1.8 0 0 1-2.4-2.7z"
        fill="url(#fi-home-roof)"
      />
      <rect x="19.5" y="28" width="9" height="14" rx="1.6" fill="#fff" fillOpacity="0.92" />
    </svg>
  );
}

export function ResumeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fi-doc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6ecf5" />
        </linearGradient>
        <linearGradient id="fi-doc-fold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cfdcf0" />
          <stop offset="1" stopColor="#9fb6d8" />
        </linearGradient>
        <linearGradient id="fi-doc-badge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3aa6ff" />
          <stop offset="1" stopColor="#0a5bd3" />
        </linearGradient>
      </defs>
      <path
        d="M12 4h16l12 12v26a2.5 2.5 0 0 1-2.5 2.5h-25A2.5 2.5 0 0 1 10 42V6.5A2.5 2.5 0 0 1 12 4z"
        fill="url(#fi-doc)"
        stroke="#b9c7dc"
        strokeWidth="1"
      />
      <path d="M28 4v9.5a2.5 2.5 0 0 0 2.5 2.5H40z" fill="url(#fi-doc-fold)" />
      <path d="M16 21h12M16 26.5h16M16 32h16M16 37.5h10" stroke="#8aa3c7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="35" cy="37" r="7" fill="url(#fi-doc-badge)" />
      <circle cx="35" cy="34.7" r="2" fill="#fff" />
      <path d="M31.2 40.4a4.2 4.2 0 0 1 7.6 0" fill="#fff" />
    </svg>
  );
}

export function ContactIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fi-mail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4fb4ff" />
          <stop offset="1" stopColor="#0a63d6" />
        </linearGradient>
        <linearGradient id="fi-mail-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe4ff" />
          <stop offset="1" stopColor="#7cc4ff" />
        </linearGradient>
      </defs>
      <rect x="4" y="10" width="40" height="29" rx="4" fill="url(#fi-mail)" />
      <path
        d="M5.2 12.4 22 25.6a3.3 3.3 0 0 0 4 0l16.8-13.2A4 4 0 0 0 40 10H8a4 4 0 0 0-2.8 2.4z"
        fill="url(#fi-mail-flap)"
      />
    </svg>
  );
}

/** Four-pane window logo for the Start button and the theme switch. */
export function WindowsLogo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fi-win" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#52c6ff" />
          <stop offset="1" stopColor="#0067d6" />
        </linearGradient>
      </defs>
      <path d="M2 2h7.5v7.5H2zM10.5 2H18v7.5h-7.5zM2 10.5h7.5V18H2zM10.5 10.5H18V18h-7.5z" fill="url(#fi-win)" />
    </svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="7" fill="#0a66c2" />
      <rect x="12.5" y="20" width="5.5" height="15.5" rx="1" fill="#fff" />
      <circle cx="15.25" cy="14.6" r="3.2" fill="#fff" />
      <path
        d="M21.5 20h5v2.4c1.1-1.8 3-2.8 5.4-2.8 3.9 0 5.8 2.5 5.8 6.9v9h-5.4v-8c0-2.2-.8-3.4-2.6-3.4-1.9 0-2.9 1.3-2.9 3.4v8h-5.3z"
        fill="#fff"
      />
    </svg>
  );
}

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#24292f" />
      <path
        fill="#fff"
        d="M12 5.2a6.8 6.8 0 0 0-2.15 13.25c.34.06.46-.15.46-.33v-1.15c-1.9.41-2.3-.92-2.3-.92-.31-.79-.76-1-.76-1-.62-.42.05-.41.05-.41.68.05 1.04.7 1.04.7.61 1.04 1.6.74 1.99.57.06-.44.24-.74.43-.91-1.51-.17-3.1-.76-3.1-3.37 0-.74.27-1.35.7-1.83-.07-.17-.3-.86.07-1.8 0 0 .57-.18 1.87.7a6.5 6.5 0 0 1 3.4 0c1.3-.88 1.87-.7 1.87-.7.37.94.14 1.63.07 1.8.44.48.7 1.09.7 1.83 0 2.62-1.6 3.2-3.11 3.37.24.21.46.62.46 1.25v1.86c0 .18.12.4.47.33A6.8 6.8 0 0 0 12 5.2z"
      />
    </svg>
  );
}
