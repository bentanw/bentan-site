"use client";

import { useEffect, useRef, useState } from "react";
import type { Theme } from "@/lib/theme";
import { ThemeSwitch } from "../ThemeSwitch";
import { INSETS } from "@/lib/constants/layout";
import { useClock } from "../win/Taskbar";

type MenuBarProps = {
  appName: string;
  theme: Theme;
  onThemeToggle: () => void;
  soundOn: boolean;
  onSoundToggle: () => void;
};

function SpeakerGlyph({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 20 16" className="h-3.75 w-4.5" aria-hidden="true" fill="currentColor">
      <path d="M2.5 5.5h2.6L9 2.2c.5-.4 1.2-.1 1.2.6v10.4c0 .7-.7 1-1.2.6L5.1 10.5H2.5A1 1 0 0 1 1.5 9.5v-3a1 1 0 0 1 1-1z" />
      {muted ? (
        <path d="M13 5.5l5 5M18 5.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <>
          <path
            d="M12.6 5.4a3.6 3.6 0 0 1 0 5.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M14.9 3.3a6.6 6.6 0 0 1 0 9.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

function GearGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true" fill="currentColor">
      <mask id="gear-hole">
        <rect width="20" height="20" fill="#fff" />
        <circle cx="10" cy="10" r="2.7" fill="#000" />
      </mask>
      <g mask="url(#gear-hole)">
        <circle cx="10" cy="10" r="6.2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <rect key={a} x="8.5" y="1.4" width="3" height="4" rx="0.9" transform={`rotate(${a} 10 10)`} />
        ))}
      </g>
    </svg>
  );
}

/** Settings button (top left, where the Apple menu would be) with a popover holding the theme switch. */
function Settings({ theme, onThemeToggle }: { theme: Theme; onThemeToggle: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    // Runs before the desktop's window-level Escape handler, so Escape closes only the popover.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Settings"
        onClick={() => setOpen((o) => !o)}
        className={`mac-menu-btn grid h-6 place-items-center px-2 ${open ? "bg-white/25" : ""}`}
      >
        <GearGlyph />
      </button>
      {open && (
        <div role="dialog" aria-label="Settings" className="mac-popover absolute top-full left-0 mt-1.5 w-66 p-3.5">
          <p className="text-ui font-semibold">Appearance</p>
          <p className="mt-0.5 mb-3 text-xs text-mac-text-secondary">Switch between the Windows and macOS desktops.</p>
          <ThemeSwitch theme={theme} onToggle={onThemeToggle} className="w-full" />
        </div>
      )}
    </div>
  );
}

/** macOS Tahoe's fully transparent menu bar, with a faint scrim so white text stays legible. */
export function MenuBar({ appName, theme, onThemeToggle, soundOn, onSoundToggle }: MenuBarProps) {
  const now = useClock();
  return (
    <div
      className="mac-menubar z-chrome fixed inset-x-0 top-0 flex items-center gap-1 pr-3 pl-2 text-ui text-white select-none sm:pr-4"
      style={{ height: INSETS.mac.top }}
    >
      <Settings theme={theme} onThemeToggle={onThemeToggle} />
      <span className="px-1.5 font-bold">{appName}</span>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          data-sound-toggle
          onClick={onSoundToggle}
          aria-label={soundOn ? "Mute ambient rain" : "Play ambient rain"}
          title={soundOn ? "Ambient rain: on" : "Ambient rain: off"}
          className="mac-menu-btn grid h-6 place-items-center px-2"
        >
          <SpeakerGlyph muted={!soundOn} />
        </button>
        {now && (
          <time dateTime={now.toISOString()} className="px-2 font-medium tabular-nums">
            <span className="hidden sm:inline">
              {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              {"  "}
            </span>
            {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </time>
        )}
      </div>
    </div>
  );
}
