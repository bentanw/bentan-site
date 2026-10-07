"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";

function hue(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

const initialsOf = (name: string) =>
  name
    .split(/[\s/-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** Small app-style icon for a project: its initial on the same hue as its generated cover. Scales to any size. */
export function ProjectFavicon({ project }: { project: Project }) {
  const h = hue(project.slug);
  const id = `pf-${project.slug}`;
  return (
    <svg viewBox="0 0 16 16" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${h} 85% 60%)`} />
          <stop offset="1" stopColor={`hsl(${(h + 60) % 360} 80% 45%)`} />
        </linearGradient>
      </defs>
      <rect width="16" height="16" rx="3.5" fill={`url(#${id})`} />
      <text
        x="8"
        y="11.6"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="#fff"
      >
        {initialsOf(project.name).slice(0, 1)}
      </text>
    </svg>
  );
}

/** Screenshot of the project, or a generated cover when there isn't one (or it fails to load). */
export function ProjectPreview({ project, className = "" }: { project: Project; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (project.preview && !failed) {
    return (
      <img
        src={project.preview}
        alt={`${project.name} preview`}
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        className={`aspect-screenshot w-full object-cover object-top ${className}`}
      />
    );
  }

  const h = hue(project.slug);
  const initials = initialsOf(project.name);
  return (
    <div
      aria-hidden="true"
      className={`relative grid aspect-screenshot w-full place-items-center overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 20% 10%, hsl(${h} 90% 70%), transparent 60%), radial-gradient(100% 80% at 90% 100%, hsl(${(h + 60) % 360} 85% 55%), transparent 60%), hsl(${(h + 200) % 360} 60% 25%)`,
      }}
    >
      <span className="text-5xl font-black tracking-tight text-white/90 drop-shadow-lg">{initials}</span>
      <span className="absolute bottom-2 left-3 max-w-4/5 truncate text-xs font-semibold text-white/80">
        {project.stack.slice(0, 3).join(" · ")}
      </span>
    </div>
  );
}
