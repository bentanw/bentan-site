"use client";

import { useEffect, useState } from "react";
import { WindowsLogo } from "../icons";
import { INSETS } from "@/lib/constants/layout";

export type TaskbarItem = { id: string; label: string; icon: React.ReactNode; open: boolean; active: boolean };

type TaskbarProps = {
  items: TaskbarItem[];
  onItemClick: (id: string) => void;
  startOpen: boolean;
  onStartClick: () => void;
  soundOn: boolean;
  onSoundToggle: () => void;
};

export function useClock() {
  // Client-side only so the server's time never mismatches the visitor's.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function SpeakerGlyph({ muted }: { muted: boolean }) {
  const line = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
      <path d="M3 7.5h2.8L10 4v12l-4.2-3.5H3a.5.5 0 0 1-.5-.5V8a.5.5 0 0 1 .5-.5z" {...line} />
      {muted ? (
        <path d="M13 8l4 4M17 8l-4 4" {...line} />
      ) : (
        <>
          <path d="M13 7.5a3.5 3.5 0 0 1 0 5" {...line} />
          <path d="M15.2 5.3a6.6 6.6 0 0 1 0 9.4" {...line} />
        </>
      )}
    </svg>
  );
}

/** Windows 11 taskbar: centered Start button and app buttons, system tray on the right. */
export function Taskbar({ items, onItemClick, startOpen, onStartClick, soundOn, onSoundToggle }: TaskbarProps) {
  const now = useClock();
  return (
    // Three columns keep the app buttons centred while the tray stays on the right, even on phones.
    <div
      className="win-taskbar z-chrome fixed inset-x-0 bottom-0 grid grid-cols-[1fr_auto_1fr] items-center gap-1 px-1 select-none sm:px-2"
      style={{ height: INSETS.win.bottom }}
    >
      <div className="col-start-2 flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1">
        <button
          type="button"
          aria-label="Start"
          aria-expanded={startOpen}
          aria-haspopup="menu"
          title="Start"
          onClick={onStartClick}
          // Keep the Start menu's outside-click handler from instantly closing the menu we're opening.
          onPointerDown={(e) => e.stopPropagation()}
          className={`win-task ${startOpen ? "active" : ""}`}
        >
          <WindowsLogo className="h-6 w-6" />
        </button>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-label={item.label}
            onClick={() => onItemClick(item.id)}
            className={`win-task ${item.open ? "open" : ""} ${item.active ? "active" : ""}`}
          >
            <span className="h-6 w-6">{item.icon}</span>
            <span className="win-task-dot" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="flex items-center justify-self-end text-xs sm:gap-0.5">
        <button
          type="button"
          data-sound-toggle
          onClick={onSoundToggle}
          aria-label={soundOn ? "Mute ambient rain" : "Play ambient rain"}
          title={soundOn ? "Ambient rain: on (click to mute)" : "Ambient rain: off (click to play)"}
          className="win-tray-btn"
        >
          <SpeakerGlyph muted={!soundOn} />
        </button>
        {now && (
          <time
            dateTime={now.toISOString()}
            title={now.toLocaleDateString(undefined, { dateStyle: "full" })}
            className="win-tray-btn flex-col items-end justify-center leading-tight"
          >
            <span>{now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
            <span className="hidden sm:inline">
              {now.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" })}
            </span>
          </time>
        )}
      </div>
    </div>
  );
}
