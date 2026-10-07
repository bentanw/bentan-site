// Colours that have to be passed to JavaScript (Next metadata, shader props). Anything styled with
// Tailwind classes uses the named tokens in src/app/theme.css instead.

export const COLORS = {
  /** Browser toolbar tint on phones; matches --color-win-desktop. */
  browserTheme: "#0b3aa8",

  /** Flowing mesh-gradient wallpaper on the macOS desktop, darkest to lightest. */
  macWallpaper: ["#071a4a", "#0f4fc0", "#3b8dff", "#9fd4ff", "#f3d9bd"],

  /** Liquid-metal monogram: transparent background with a white sheen. */
  liquidLogoBack: "#00000000",
  liquidLogoTint: "#ffffff",
} as const;
