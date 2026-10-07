"use client";

import { useEffect, useRef } from "react";
import type { Theme } from "@/lib/theme";
import type { Project, Resume } from "@/lib/types";
import { ProjectFavicon } from "../apps/ProjectPreview";
import { ThemeSwitch } from "../ThemeSwitch";
import { INSETS, START_MENU_GAP } from "@/lib/constants/layout";

export type LaunchItem = {
  id: string;
  label: string;
  description: string;
  Icon: (props: { className?: string }) => React.ReactNode;
};

type StartMenuProps = {
  resume: Resume;
  items: LaunchItem[];
  projects: Project[];
  onLaunch: (id: string) => void;
  theme: Theme;
  onThemeToggle: () => void;
  onClose: () => void;
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Windows 11 Start menu: Pinned apps, Recommended (projects), and an account bar holding the theme switch. */
export function StartMenu({ resume, items, projects, onLaunch, theme, onThemeToggle, onClose }: StartMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      className="win-startmenu z-menu fixed inset-x-2 mx-auto flex max-w-140 flex-col"
      style={{
        bottom: INSETS.win.bottom + START_MENU_GAP,
        maxHeight: `calc(100dvh - ${INSETS.win.bottom + START_MENU_GAP * 2}px)`,
      }}
    >
      <div className="min-h-0 overflow-y-auto px-5 pt-5 pb-4 sm:px-8 sm:pt-6">
        <p className="mb-3 text-sm font-semibold">Pinned</p>
        <ul className="grid grid-cols-3 gap-1 sm:grid-cols-6">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="menuitem"
                title={item.description}
                onClick={() => onLaunch(item.id)}
                className="win-start-app flex w-full cursor-default flex-col items-center gap-1.5 px-1 pt-3 pb-2 text-xs"
              >
                <item.Icon className="h-8 w-8" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {projects.length > 0 && (
          <>
            <p className="mt-5 mb-2 text-sm font-semibold">Recommended</p>
            <ul className="grid gap-1 sm:grid-cols-2">
              {projects.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => onLaunch(`project:${p.slug}`)}
                    className="win-start-app flex w-full cursor-default items-center gap-3 px-2.5 py-2 text-left"
                  >
                    <span className="h-8 w-8 shrink-0">
                      <ProjectFavicon project={p} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs">{p.name}</span>
                      <span className="block truncate text-2xs text-win-text-secondary">
                        {p.tag ?? p.stack.slice(0, 2).join(" · ")}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Account bar; the switch sits where the power button would be. */}
      <div className="win-startmenu-footer flex shrink-0 items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <span className="flex min-w-0 items-center gap-2.5 text-xs">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-b from-win-avatar-top to-win-avatar-bottom text-2xs font-semibold text-white">
            {initialsOf(resume.name)}
          </span>
          <span className="truncate">{resume.name}</span>
        </span>
        <ThemeSwitch theme={theme} onToggle={onThemeToggle} />
      </div>
    </div>
  );
}
