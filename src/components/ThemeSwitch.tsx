import { THEME_LABEL, type Theme } from "@/lib/theme";
import { WindowsLogo } from "./icons";

/**
 * Two-position toggle for flipping between the Windows and macOS looks. It lives in the Windows Start
 * menu and in the macOS settings popover.
 */
export function ThemeSwitch({
  theme,
  onToggle,
  className = "",
}: {
  theme: Theme;
  onToggle: () => void;
  className?: string;
}) {
  const other: Theme = theme === "mac" ? "win" : "mac";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to the ${THEME_LABEL[other]} look`}
      title={`Switch to ${THEME_LABEL[other]}`}
      data-on={theme === "mac"}
      className={`os-switch ${className}`}
    >
      <span className="os-switch-thumb" aria-hidden="true" />
      <span className="os-switch-opt" aria-hidden="true">
        <WindowsLogo className="os-switch-glyph" />
        {THEME_LABEL.win}
      </span>
      <span className="os-switch-opt" aria-hidden="true">
        <span className="os-switch-glyph grid place-items-center leading-none">⌘</span>
        {THEME_LABEL.mac}
      </span>
    </button>
  );
}
