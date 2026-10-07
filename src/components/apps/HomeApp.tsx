import type { Theme } from "@/lib/theme";
import type { Project, SiteData } from "@/lib/types";
import { ProjectPreview } from "./ProjectPreview";

type HomeAppProps = {
  data: SiteData;
  theme: Theme;
  onOpenProject: (slug: string) => void;
};

export const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export const summaryOf = (project: Project) => project.description ?? project.bullets[0]?.map((s) => s.text).join("");

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const summary = summaryOf(project);
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      className="ui-card group flex cursor-pointer flex-col overflow-hidden outline-none"
    >
      <div className="ui-card-media overflow-hidden">
        <ProjectPreview
          project={project}
          className="transition-transform duration-500 ease-out group-hover:scale-102"
        />
      </div>
      <div className="flex grow flex-col gap-2 p-5 @two-up:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="ui-h truncate text-xl">{project.name}</h3>
          {project.tag && <span className="ui-chip shrink-0 px-2 py-0.5 text-2xs">{project.tag}</span>}
        </div>
        {summary && <p className="ui-muted line-clamp-3 text-sm leading-relaxed">{summary}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {project.stack.slice(0, 5).map((s) => (
            <span key={s} className="ui-chip px-2 py-0.5 text-2xs">
              {s}
            </span>
          ))}
          {project.stack.length > 5 && (
            <span className="ui-chip px-2 py-0.5 text-2xs">+{project.stack.length - 5}</span>
          )}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ui-link ml-auto pl-2 text-ui font-medium whitespace-nowrap"
            >
              {host(project.url)} ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function HomeApp({ data, theme, onOpenProject }: HomeAppProps) {
  const { resume, projects, headline } = data;
  return (
    <div
      className={`ui-page @container min-h-full select-text ${theme === "mac" ? "px-6 pt-10 pb-14 sm:px-10" : "px-6 pt-8 pb-10 sm:px-9"}`}
    >
      <div className="mx-auto max-w-6xl">
        <header className={theme === "mac" ? "mb-10" : "mb-8"}>
          <p className="ui-eyebrow">Portfolio</p>
          <h1 className={`ui-h ${theme === "mac" ? "text-hero-mac leading-display" : "text-hero-win leading-tight"}`}>
            Hi, I&apos;m {resume.name}.
          </h1>
          <p className={`ui-muted mt-2 ${theme === "mac" ? "text-hero-lede-mac" : "text-base"}`}>{headline}</p>
        </header>

        <h2 className={`ui-h ui-section mb-4 pb-1 ${theme === "mac" ? "text-2xl" : "text-xl"}`}>Projects</h2>
        {/* One big column in a narrow window, two side by side once there's room. */}
        <div className="grid grid-cols-1 gap-6 @two-up:grid-cols-2 @two-up:gap-7">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} onOpen={() => onOpenProject(p.slug)} />
          ))}
        </div>
      </div>
    </div>
  );
}
