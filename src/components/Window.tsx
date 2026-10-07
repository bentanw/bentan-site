"use client";

import { useRef } from "react";
import { insetsFor, SAFARI_TOOLBAR_HEIGHT } from "@/lib/constants/layout";
import type { Theme } from "@/lib/theme";

export type WindowFrame = { x: number; y: number; w: number; h: number };

/** Safari-only state: the address bar and back/forward/share toolbar actions. */
export type SafariChrome = {
  icon: React.ReactNode;
  address: { host: string; path: string };
  canBack: boolean;
  canForward: boolean;
  share?: { label: string; href: string };
  onBack: () => void;
  onForward: () => void;
};

type WindowProps = {
  theme: Theme;
  title: string;
  icon: React.ReactNode;
  frame: WindowFrame;
  zIndex: number;
  active: boolean;
  minimized: boolean;
  maximized: boolean;
  isMobile: boolean;
  /** Changes whenever the page changes, so the scroll position resets like a real navigation. */
  contentKey: string;
  safari?: SafariChrome;
  minSize?: { w: number; h: number };
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onFrameChange: (frame: WindowFrame) => void;
  children: React.ReactNode;
};

// How much of a window must stay on screen when dragged toward an edge.
const KEEP_VISIBLE = 80;

// Windows 11 caption-button glyphs (thin, 10px).
function CaptionGlyph({ kind }: { kind: "min" | "max" | "restore" | "close" }) {
  const line = { fill: "none", stroke: "currentColor", strokeWidth: 1 } as const;
  return (
    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden="true" shapeRendering="geometricPrecision">
      {kind === "min" && <path d="M0 5.5h10" {...line} />}
      {kind === "max" && <rect x="0.5" y="0.5" width="9" height="9" rx="1.5" {...line} />}
      {kind === "restore" && (
        <>
          <rect x="0.5" y="2.5" width="7" height="7" rx="1.2" {...line} />
          <path d="M2.5 2.5V2A1.5 1.5 0 0 1 4 .5h4A1.5 1.5 0 0 1 9.5 2v4A1.5 1.5 0 0 1 8 7.5h-.5" {...line} />
        </>
      )}
      {kind === "close" && <path d="M0.5 0.5l9 9M9.5 0.5l-9 9" {...line} />}
    </svg>
  );
}

function LightGlyph({ kind }: { kind: "close" | "min" | "max" }) {
  return (
    <svg viewBox="0 0 8 8" className="h-2 w-2" aria-hidden="true">
      {kind === "close" && (
        <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="#4d0000" strokeWidth="1.2" strokeLinecap="round" />
      )}
      {kind === "min" && <path d="M1.2 4h5.6" stroke="#5a3a00" strokeWidth="1.3" strokeLinecap="round" />}
      {kind === "max" && <path d="M1.5 6.5V3l3.5 3.5zM6.5 1.5V5L3 1.5z" fill="#0a4a00" />}
    </svg>
  );
}

// SF Symbols-like toolbar glyphs.
function Sym({ name }: { name: "back" | "forward" | "share" }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  return (
    <svg viewBox="0 0 20 20" className="size-4.25" aria-hidden="true">
      {name === "back" && <path d="M12.5 3.5 6 10l6.5 6.5" {...p} strokeWidth={2} />}
      {name === "forward" && <path d="M7.5 3.5 14 10l-6.5 6.5" {...p} strokeWidth={2} />}
      {name === "share" && (
        <>
          <path d="M10 2.5v10M6.5 6 10 2.5 13.5 6" {...p} />
          <path
            d="M7 8.5H5.5A1.5 1.5 0 0 0 4 10v6a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 16 16v-6a1.5 1.5 0 0 0-1.5-1.5H13"
            {...p}
          />
        </>
      )}
    </svg>
  );
}

export function Window({
  theme,
  title,
  icon,
  frame,
  zIndex,
  active,
  minimized,
  maximized,
  isMobile,
  contentKey,
  safari,
  minSize = { w: 320, h: 220 },
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFrameChange,
  children,
}: WindowProps) {
  // Pointer position and frame at the moment a drag/resize started.
  const gesture = useRef<{ kind: "move" | "resize"; px: number; py: number; start: WindowFrame } | null>(null);
  const fullscreen = maximized || isMobile;
  const inset = insetsFor(theme, isMobile);

  const beginGesture = (kind: "move" | "resize") => (e: React.PointerEvent) => {
    onFocus();
    if (fullscreen || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { kind, px: e.clientX, py: e.clientY, start: frame };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.px;
    const dy = e.clientY - g.py;
    if (g.kind === "move") {
      const maxX = window.innerWidth - KEEP_VISIBLE;
      const maxY = window.innerHeight - inset.bottom - 30;
      onFrameChange({
        ...g.start,
        x: Math.min(Math.max(g.start.x + dx, KEEP_VISIBLE - g.start.w), maxX),
        y: Math.min(Math.max(g.start.y + dy, inset.top), maxY),
      });
    } else {
      onFrameChange({
        ...g.start,
        w: Math.max(g.start.w + dx, minSize.w),
        h: Math.max(g.start.h + dy, minSize.h),
      });
    }
  };

  const endGesture = () => {
    gesture.current = null;
  };

  const gap = theme === "mac" && !isMobile ? 6 : 0;
  const style: React.CSSProperties = fullscreen
    ? {
        left: gap,
        top: inset.top + gap,
        width: `calc(100vw - ${gap * 2}px)`,
        height: `calc(100dvh - ${inset.top + inset.bottom + gap * 2}px)`,
        zIndex,
      }
    : { left: frame.x, top: frame.y, width: frame.w, height: frame.h, zIndex };

  const dragProps = {
    onPointerDown: beginGesture("move"),
    onPointerMove,
    onPointerUp: endGesture,
    onPointerCancel: endGesture,
    onDoubleClick: () => !isMobile && onToggleMaximize(),
  };
  const stop = {
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onDoubleClick: (e: React.MouseEvent) => e.stopPropagation(),
  };

  const resizeHandle = !fullscreen && (
    <div
      aria-hidden="true"
      // Rounded corners clip hit-testing, so tuck the grip inside the curve.
      className={`absolute z-20 cursor-nwse-resize ${theme === "win" ? "right-0 bottom-0 h-4 w-4" : "right-1 bottom-1 h-5 w-5"}`}
      onPointerDown={beginGesture("resize")}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
    />
  );

  // ---------- Windows 11 ----------
  if (theme === "win") {
    return (
      <section
        role="dialog"
        aria-label={title}
        className={`win-window ${active ? "" : "inactive"} ${fullscreen ? "maximized" : ""} window-pop fixed flex flex-col ${minimized ? "hidden" : ""}`}
        style={style}
        onPointerDown={onFocus}
      >
        <header className="win-titlebar flex h-8 shrink-0 items-center select-none" {...dragProps}>
          <span className="ml-3 h-4 w-4 shrink-0">{icon}</span>
          <span className="ml-2.5 min-w-0 grow truncate">{title}</span>
          <div className="flex h-full items-stretch" {...stop}>
            <button
              type="button"
              aria-label={`Minimize ${title}`}
              title="Minimize"
              className="win-cap"
              onClick={onMinimize}
            >
              <CaptionGlyph kind="min" />
            </button>
            {!isMobile && (
              <button
                type="button"
                aria-label={maximized ? `Restore ${title}` : `Maximize ${title}`}
                title={maximized ? "Restore Down" : "Maximize"}
                className="win-cap"
                onClick={onToggleMaximize}
              >
                <CaptionGlyph kind={maximized ? "restore" : "max"} />
              </button>
            )}
            <button
              type="button"
              aria-label={`Close ${title}`}
              title="Close"
              className="win-cap close"
              onClick={onClose}
            >
              <CaptionGlyph kind="close" />
            </button>
          </div>
        </header>
        <div key={contentKey} className="min-h-0 grow overflow-auto">
          {children}
        </div>
        {resizeHandle}
      </section>
    );
  }

  // ---------- Safari (macOS Tahoe) ----------
  return (
    <section
      role="dialog"
      aria-label={title}
      className={`mac-window ${active ? "" : "inactive"} ${fullscreen ? "maximized" : ""} window-pop fixed flex flex-col ${minimized ? "hidden" : ""}`}
      style={style}
      onPointerDown={onFocus}
    >
      {/* The page scrolls underneath the translucent toolbar, as in Safari 26. */}
      <div
        key={contentKey}
        className="mac-page absolute inset-0 overflow-auto"
        style={{ paddingTop: SAFARI_TOOLBAR_HEIGHT, scrollPaddingTop: SAFARI_TOOLBAR_HEIGHT }}
      >
        {children}
      </div>

      <header className="mac-toolbar absolute inset-x-0 top-0 z-10 select-none" {...dragProps}>
        <div
          className="grid items-center gap-2 px-3.5 sm:gap-3"
          style={{
            height: SAFARI_TOOLBAR_HEIGHT,
            gridTemplateColumns: "minmax(max-content,1fr) minmax(0,460px) minmax(max-content,1fr)",
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="mac-lights flex items-center gap-2" {...stop}>
              <button type="button" aria-label={`Close ${title}`} className="mac-light bg-mac-close" onClick={onClose}>
                <LightGlyph kind="close" />
              </button>
              <button
                type="button"
                aria-label={`Minimize ${title}`}
                className="mac-light bg-mac-minimize"
                onClick={onMinimize}
              >
                <LightGlyph kind="min" />
              </button>
              {!isMobile && (
                <button
                  type="button"
                  aria-label={maximized ? `Restore ${title}` : `Zoom ${title}`}
                  className="mac-light bg-mac-zoom"
                  onClick={onToggleMaximize}
                >
                  <LightGlyph kind="max" />
                </button>
              )}
            </div>
            {safari && (
              <div className="mac-capsule flex" {...stop}>
                <button
                  type="button"
                  aria-label="Back"
                  title="Back"
                  disabled={!safari.canBack}
                  onClick={safari.onBack}
                  className="mac-tool"
                >
                  <Sym name="back" />
                </button>
                <button
                  type="button"
                  aria-label="Forward"
                  title="Forward"
                  disabled={!safari.canForward}
                  onClick={safari.onForward}
                  className="mac-tool"
                >
                  <Sym name="forward" />
                </button>
              </div>
            )}
          </div>

          {safari ? (
            <div
              className="mac-capsule mac-address flex min-w-0 items-center justify-center gap-1.5 px-3"
              title={`${safari.address.host}${safari.address.path}`}
              {...stop}
            >
              <span className="h-3.5 w-3.5 shrink-0">{safari.icon}</span>
              <span className="truncate">
                {safari.address.host}
                <span className="text-mac-text-tertiary">{safari.address.path === "/" ? "" : safari.address.path}</span>
              </span>
            </div>
          ) : (
            <span className="mac-title truncate text-center">{title}</span>
          )}

          {safari && (
            <div className="flex justify-end" {...stop}>
              <div className="mac-capsule flex">
                {safari.share ? (
                  <a
                    href={safari.share.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={safari.share.label}
                    title={safari.share.label}
                    className="mac-tool"
                  >
                    <Sym name="share" />
                  </a>
                ) : (
                  <button type="button" aria-label="Share" disabled className="mac-tool">
                    <Sym name="share" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {resizeHandle}
    </section>
  );
}
