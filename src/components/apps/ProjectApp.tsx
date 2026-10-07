import type { Theme } from "@/lib/theme";
import type { Project } from "@/lib/types";
import { Rich } from "../Rich";
import { host } from "./HomeApp";
import { ProjectPreview } from "./ProjectPreview";

export function ProjectApp({ project, theme }: { project: Project; theme: Theme }) {
  return (
    <div className={`ui-page min-h-full select-text ${theme === "mac" ? "px-6 pt-8 pb-14 sm:px-10" : "p-5"}`}>
      <article className="mx-auto max-w-4xl">
        <div className="ui-card-media ui-shot overflow-hidden">
          <ProjectPreview project={project} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className={`ui-h ${theme === "mac" ? "text-display leading-tight" : "text-2xl"}`}>{project.name}</h1>
          {project.tag && <span className="ui-chip px-2 py-0.5 text-xs">{project.tag}</span>}
        </div>
        {project.description && (
          <p className={`ui-muted mt-1.5 ${theme === "mac" ? "text-lede" : "text-sm"}`}>{project.description}</p>
        )}

        {(project.url || project.repo) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.url && (
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="ui-btn primary">
                Visit {host(project.url)} ↗
              </a>
            )}
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noopener noreferrer" className="ui-btn">
                Source Code ↗
              </a>
            )}
          </div>
        )}

        {project.bullets.length > 0 && (
          <>
            <h2 className="ui-h ui-section mt-7 mb-2 pb-1 text-lg">What I built</h2>
            <ul className="list-disc space-y-1.5 pl-5 leading-relaxed">
              {project.bullets.map((b, k) => (
                <li key={k}>
                  <Rich value={b} />
                </li>
              ))}
            </ul>
          </>
        )}

        {project.stack.length > 0 && (
          <>
            <h2 className="ui-h ui-section mt-7 mb-2 pb-1 text-lg">Stack</h2>
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <span key={s} className="ui-chip px-2.5 py-0.5 text-xs">
                  {s}
                </span>
              ))}
            </div>
          </>
        )}
      </article>
    </div>
  );
}
