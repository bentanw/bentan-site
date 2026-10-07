import type { Theme } from "../theme";

type Size = { w: number; h: number };

/** Screen space reserved by each theme's chrome (Windows taskbar; macOS menu bar and Dock), in px. */
export const INSETS: Record<Theme, { top: number; bottom: number }> = {
  win: { top: 0, bottom: 48 },
  mac: { top: 30, bottom: 88 },
};

/** The smaller macOS Dock on phones. */
const MAC_PHONE_INSETS = { top: 30, bottom: 70 };

/** Phones and short landscape screens: windows go full screen and the Dock shrinks. Keep in sync with globals.css. */
export const MOBILE_QUERY = "(max-width: 640px), (max-height: 500px)";

/** Chrome insets for the current screen; only the macOS Dock gets smaller on phones. */
export const insetsFor = (theme: Theme, isMobile: boolean) =>
  theme === "mac" && isMobile ? MAC_PHONE_INSETS : INSETS[theme];

/** Height of the Safari toolbar the page scrolls under. */
export const SAFARI_TOOLBAR_HEIGHT = 52;

/** Gap between the Windows Start menu and the taskbar. */
export const START_MENU_GAP = 12;

/** Preferred window size when each page first opens; shrunk to fit smaller screens. */
export const WINDOW_SIZES: Record<"home" | "resume" | "contact" | "project", Record<Theme, Size>> = {
  home: { win: { w: 1200, h: 760 }, mac: { w: 1320, h: 820 } },
  resume: { win: { w: 820, h: 720 }, mac: { w: 880, h: 800 } },
  contact: { win: { w: 460, h: 300 }, mac: { w: 480, h: 500 } },
  project: { win: { w: 760, h: 680 }, mac: { w: 980, h: 760 } },
};
