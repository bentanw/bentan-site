"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { startAmbience, stopAmbience } from "@/lib/ambience";
import { INSETS, insetsFor, MOBILE_QUERY, WINDOW_SIZES } from "@/lib/constants/layout";
import type { Theme } from "@/lib/theme";
import type { SiteData } from "@/lib/types";
import { ContactApp } from "./apps/ContactApp";
import { HomeApp } from "./apps/HomeApp";
import { ProjectApp } from "./apps/ProjectApp";
import { ProjectFavicon } from "./apps/ProjectPreview";
import { ResumeApp } from "./apps/ResumeApp";
import { ContactIcon, HomeIcon, ResumeIcon } from "./icons";
import { MacContactIcon, MacHomeIcon, MacResumeIcon } from "./mac/AppIcons";
import { Dock } from "./mac/Dock";
import { GlassDefs } from "./mac/GlassDefs";
import { LiquidLogo } from "./mac/LiquidLogo";
import { MenuBar } from "./mac/MenuBar";
import { Wallpaper } from "./mac/Wallpaper";
import { Window, type WindowFrame } from "./Window";
import { type LaunchItem, StartMenu } from "./win/StartMenu";
import { Taskbar } from "./win/Taskbar";

type IconComponent = (p: { className?: string }) => React.ReactNode;
type Size = { w: number; h: number };

/** On macOS a window is a Safari window with back/forward history of page ids; Windows windows only ever hold one page. */
type WindowState = {
  frame: WindowFrame;
  z: number;
  minimized: boolean;
  maximized: boolean;
  history: string[];
  index: number;
};

type PageInfo = {
  title: string;
  path: string;
  icon: React.ReactNode;
  size: Record<Theme, Size>;
  share?: { label: string; href: string };
  body: (windowId: string) => React.ReactNode;
};

// Desktop shortcuts, in order: the Windows icon column and taskbar, and the macOS Dock.
const LAUNCH_ITEMS: (LaunchItem & { MacIcon: IconComponent })[] = [
  { id: "home", label: "Home", description: "My projects", Icon: HomeIcon, MacIcon: MacHomeIcon },
  { id: "resume", label: "Resume", description: "View my resume", Icon: ResumeIcon, MacIcon: MacResumeIcon },
  {
    id: "contact",
    label: "Contact",
    description: "E-mail, LinkedIn & GitHub",
    Icon: ContactIcon,
    MacIcon: MacContactIcon,
  },
];

const THEME_KEY = "theme";
const SOUND_KEY = "ambience";

const pageOf = (w: WindowState) => w.history[w.index];

/** Home stays open: it can be minimized but not closed. */
const closable = (id: string) => id !== "home";

/** The launcher section a page belongs to (project pages are opened from Home). */
const sectionOf = (page: string) => LAUNCH_ITEMS.find((i) => i.id === page)?.label ?? "Home";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

function readPref(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writePref(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

// Ambient rain. Browsers block audio until the visitor interacts, so playback starts on the
// first click or key press anywhere (unless they've muted it before).
function useAmbience() {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const wanted = readPref(SOUND_KEY) !== "off";
    setSoundOn(wanted);
    if (!wanted) return;

    const unlock = (e: Event) => {
      // Let a first click on a speaker button mean "mute", not "play then mute".
      if ((e.target as Element | null)?.closest?.("[data-sound-toggle]")) return;
      startAmbience();
      remove();
    };
    const remove = () => {
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
    return remove;
  }, []);

  const toggle = useCallback(() => {
    setSoundOn((on) => {
      const next = !on;
      writePref(SOUND_KEY, next ? "on" : "off");
      if (next) startAmbience();
      else stopAmbience();
      return next;
    });
  }, []);

  return { soundOn, toggle };
}

export function Desktop({ data }: { data: SiteData }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [siteHost, setSiteHost] = useState("");
  const topZ = useRef(10);
  const lastPointer = useRef("mouse");
  const isMobile = useIsMobile();
  const { soundOn, toggle: toggleSound } = useAmbience();
  const { resume, projects } = data;

  useEffect(() => {
    const saved = readPref(THEME_KEY);
    setTheme(saved === "win" ? "win" : "mac");
    setSiteHost(window.location.host);
  }, []);

  /** Apply a change to one window; returning null closes it. */
  const update = useCallback((id: string, fn: (w: WindowState) => WindowState | null) => {
    setWindows((ws) => {
      const w = ws[id];
      if (!w) return ws;
      const next = fn(w);
      if (next) return { ...ws, [id]: next };
      const { [id]: _, ...rest } = ws;
      return rest;
    });
  }, []);

  /** Load a page in the window, like following a link. */
  const navigate = (id: string, page: string) =>
    update(id, (w) =>
      pageOf(w) === page ? w : { ...w, history: [...w.history.slice(0, w.index + 1), page], index: w.index + 1 },
    );

  /** Move the window back or forward through its history. */
  const go = (id: string, delta: number) =>
    update(id, (w) => ({ ...w, index: Math.min(Math.max(w.index + delta, 0), w.history.length - 1) }));

  // Everything that can be shown in a window (or Safari tab), keyed by page id.
  const pageInfo = (page: string): PageInfo | null => {
    const t = theme ?? "mac";
    const icon = (Win: IconComponent, Mac: IconComponent) =>
      t === "win" ? <Win className="h-full w-full" /> : <Mac className="h-full w-full" />;
    if (page === "home") {
      return {
        title: t === "win" ? `Home – ${resume.name}` : resume.name,
        path: "/",
        icon: icon(HomeIcon, MacHomeIcon),
        size: WINDOW_SIZES.home,
        body: (id) => (
          <HomeApp
            data={data}
            theme={t}
            onOpenProject={(slug) => (t === "mac" ? navigate(id, `project:${slug}`) : open(`project:${slug}`))}
          />
        ),
      };
    }
    if (page === "resume") {
      return {
        title: t === "win" ? "Resume" : `${resume.name} – Resume`,
        path: "/resume",
        icon: icon(ResumeIcon, MacResumeIcon),
        size: WINDOW_SIZES.resume,
        share: { label: "Print / Save as PDF", href: "/resume?print" },
        body: () => <ResumeApp resume={resume} theme={t} />,
      };
    }
    if (page === "contact") {
      return {
        title: "Contact",
        path: "/contact",
        icon: icon(ContactIcon, MacContactIcon),
        size: WINDOW_SIZES.contact,
        body: () => <ContactApp resume={resume} headline={data.headline} theme={t} />,
      };
    }
    if (page.startsWith("project:")) {
      const project = projects.find((p) => `project:${p.slug}` === page);
      if (!project) return null;
      return {
        title: project.name,
        path: `/projects/${project.slug}`,
        icon: <ProjectFavicon project={project} />,
        size: WINDOW_SIZES.project,
        share: project.url ? { label: `Open ${project.name} in a new tab`, href: project.url } : undefined,
        body: () => <ProjectApp project={project} theme={t} />,
      };
    }
    return null;
  };

  const focus = useCallback((id: string) => {
    setWindows((ws) => {
      const w = ws[id];
      if (!w || (w.z === topZ.current && !w.minimized)) return ws;
      return { ...ws, [id]: { ...w, z: ++topZ.current, minimized: false } };
    });
  }, []);

  /** Bring a window to the front, opening it (sized for the current theme) if needed. */
  const open = (id: string) => {
    const info = pageInfo(id);
    if (!info) return;
    const t = theme ?? "mac";
    const inset = insetsFor(t, isMobile);
    setStartOpen(false);
    setWindows((ws) => {
      const existing = ws[id];
      if (existing) return { ...ws, [id]: { ...existing, z: ++topZ.current, minimized: false } };

      // Fit to the viewport, center in the free area, and cascade a little per open window.
      const size = info.size[t];
      const vw = window.innerWidth;
      const vh = window.innerHeight - inset.top - inset.bottom;
      const w = Math.min(size.w, vw - (t === "mac" ? 32 : 120));
      const h = Math.min(size.h, vh - 16);
      const offset = (Object.keys(ws).length % 6) * 26;
      const x = Math.min(Math.max(t === "mac" ? 16 : 104, (vw - w) / 2 + offset), vw - w - 8);
      const y = inset.top + Math.min(Math.max(8, (vh - h) / 2 + offset), vh - h - 8);
      return {
        ...ws,
        [id]: { frame: { x, y, w, h }, z: ++topZ.current, minimized: false, maximized: false, history: [id], index: 0 },
      };
    });
  };

  const close = useCallback((id: string) => update(id, () => null), [update]);

  const patch = useCallback(
    (id: string, change: Partial<WindowState>) => update(id, (w) => ({ ...w, ...change })),
    [update],
  );

  const toggleTheme = () => {
    const next: Theme = theme === "mac" ? "win" : "mac";
    writePref(THEME_KEY, next);
    setStartOpen(false);
    setTheme(next);
    // Keep windows inside the new theme's free area (below its menu bar, above its Dock / taskbar).
    const { top, bottom } = insetsFor(next, isMobile);
    const maxBottom = window.innerHeight - bottom - 8;
    setWindows((ws) =>
      Object.fromEntries(
        Object.entries(ws).map(([id, w]) => {
          const y = Math.max(top + 8, Math.min(w.frame.y, maxBottom - w.frame.h));
          return [id, { ...w, frame: { ...w.frame, y, h: Math.min(w.frame.h, maxBottom - y) } }];
        }),
      ),
    );
  };

  // Escape closes the front-most closable window (the Start menu handles its own Escape).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || startOpen) return;
      const front = Object.entries(windows)
        .filter(([, w]) => !w.minimized)
        .sort((a, b) => b[1].z - a[1].z)[0];
      if (front && closable(front[0])) close(front[0]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [windows, startOpen, close]);

  const closeStart = useCallback(() => setStartOpen(false), []);

  // Greet visitors with Home already open, in either theme.
  const openedHome = useRef(false);
  useEffect(() => {
    if (!theme || openedHome.current) return;
    openedHome.current = true;
    open("home");
  });

  // Render nothing theme-specific until the saved theme is known, to avoid flashing the wrong one.
  if (!theme) {
    return (
      <main className="h-dvh w-screen bg-mac-desktop">
        <h1 className="sr-only">
          {resume.name} – {data.headline}
        </h1>
      </main>
    );
  }

  // Keep windows in opening order in the DOM and stack them with z-index only: reordering the
  // nodes on focus would replay the open animation, reset scroll, and drop an in-progress drag.
  const openIds = Object.keys(windows).filter((id) => pageInfo(pageOf(windows[id])));
  const frontId = openIds
    .filter((id) => !windows[id].minimized)
    .reduce<string | undefined>((top, id) => (top && windows[top].z > windows[id].z ? top : id), undefined);

  const windowLayer = openIds.map((id) => {
    const w = windows[id];
    const info = pageInfo(pageOf(w))!;
    return (
      <Window
        key={id}
        theme={theme}
        title={info.title}
        icon={info.icon}
        frame={w.frame}
        zIndex={w.z}
        active={id === frontId}
        minimized={w.minimized}
        maximized={w.maximized}
        isMobile={isMobile}
        contentKey={String(w.index)}
        safari={
          theme === "mac"
            ? {
                icon: info.icon,
                address: { host: siteHost, path: info.path },
                canBack: w.index > 0,
                canForward: w.index < w.history.length - 1,
                share: info.share,
                onBack: () => go(id, -1),
                onForward: () => go(id, 1),
              }
            : undefined
        }
        onFocus={() => focus(id)}
        onClose={closable(id) ? () => close(id) : undefined}
        onMinimize={() => patch(id, { minimized: true })}
        onToggleMaximize={() => patch(id, { maximized: !w.maximized })}
        onFrameChange={(frame) => patch(id, { frame })}
      >
        {info.body(id)}
      </Window>
    );
  });

  if (theme === "mac") {
    return (
      <main data-theme="mac" className="relative h-dvh w-screen overflow-hidden select-none">
        <GlassDefs />
        <Wallpaper />

        <div
          className="pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center text-white"
          style={{ top: insetsFor("mac", isMobile).top, bottom: insetsFor("mac", isMobile).bottom }}
        >
          <LiquidLogo name={resume.name} className="size-logo" />
          <h1 className="-mt-6 text-4xl font-bold tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.25)]">
            {resume.name}
          </h1>
          <p className="mt-1 text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.3)]">{data.headline}</p>
        </div>

        {windowLayer}

        <MenuBar
          appName={frontId ? sectionOf(pageOf(windows[frontId])) : resume.name}
          theme={theme}
          onThemeToggle={toggleTheme}
          soundOn={soundOn}
          onSoundToggle={toggleSound}
        />
        <Dock
          items={LAUNCH_ITEMS.map(({ id, label, MacIcon }) => ({ id, label, Icon: MacIcon, running: !!windows[id] }))}
          onLaunch={open}
        />
      </main>
    );
  }

  return (
    <main data-theme="win" className="win-desktop relative h-dvh w-screen overflow-hidden select-none">
      {/* Clicking empty desktop clears the icon selection. */}
      <div className="absolute inset-0" onPointerDown={() => setSelected(null)} />

      <nav
        aria-label="Desktop"
        className="relative flex flex-col flex-wrap content-start items-start gap-1 p-1.5"
        style={{ maxHeight: `calc(100dvh - ${INSETS.win.bottom}px)` }}
      >
        {LAUNCH_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.description}
            className={`win-icon flex w-19.5 cursor-default flex-col items-center gap-1 px-1 pt-2 pb-1.5 outline-none ${selected === item.id ? "selected" : ""}`}
            onPointerDown={(e) => {
              lastPointer.current = e.pointerType;
              setSelected(item.id);
            }}
            // Mouse: click selects, double-click opens. Touch or keyboard: activating opens.
            onClick={(e) => {
              if (lastPointer.current === "touch" || e.detail === 0) open(item.id);
            }}
            onDoubleClick={() => open(item.id)}
          >
            <item.Icon className="drop-shadow-desktop-icon h-11 w-11" />
            <span className="win-icon-label text-center text-xs leading-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {windowLayer}

      {startOpen && (
        <StartMenu
          resume={resume}
          items={LAUNCH_ITEMS}
          projects={projects}
          onLaunch={open}
          theme={theme}
          onThemeToggle={toggleTheme}
          onClose={closeStart}
        />
      )}

      <Taskbar
        items={[
          ...LAUNCH_ITEMS.map(({ id, label, Icon }) => ({ id, label, icon: <Icon className="h-full w-full" /> })),
          // Project windows get their own taskbar buttons while open.
          ...openIds
            .filter((id) => id.startsWith("project:"))
            .map((id) => ({ id, label: pageInfo(id)!.title, icon: pageInfo(id)!.icon })),
        ].map((item) => ({ ...item, open: !!windows[item.id], active: item.id === frontId }))}
        onItemClick={(id) => (id === frontId ? patch(id, { minimized: true }) : windows[id] ? focus(id) : open(id))}
        startOpen={startOpen}
        onStartClick={() => setStartOpen((o) => !o)}
        soundOn={soundOn}
        onSoundToggle={toggleSound}
      />
    </main>
  );
}
