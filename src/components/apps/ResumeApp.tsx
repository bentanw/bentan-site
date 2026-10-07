import type { Theme } from "@/lib/theme";
import type { Resume } from "@/lib/types";
import { ResumeDocument } from "../ResumeDocument";

// On macOS, printing lives behind Safari's Share button; Windows gets a command bar button.
export function ResumeApp({ resume, theme }: { resume: Resume; theme: Theme }) {
  return (
    <div className="flex min-h-full flex-col bg-paper-backdrop">
      {theme === "win" && (
        <div className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b border-black/6 bg-win-surface/95 px-3 py-2 backdrop-blur">
          <a href="/resume?print" target="_blank" rel="noopener noreferrer" className="ui-btn">
            Print / Save as PDF
          </a>
        </div>
      )}
      <div className={theme === "mac" ? "px-2 py-4 sm:px-8 sm:py-8" : "p-2 sm:p-4"}>
        <div
          className={`mx-auto max-w-letter bg-white px-4 py-5 shadow-paper select-text sm:px-8 sm:py-7 ${theme === "mac" ? "rounded-md" : "rounded"}`}
        >
          <ResumeDocument resume={resume} />
        </div>
      </div>
    </div>
  );
}
