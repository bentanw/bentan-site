// Server-only: reads public/assets/ben_tan_resume.tex and public/assets/projects.json from disk and
// turns them into the data the site renders. Runs on every request in `next dev` and once at build.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { plain } from "./latex.ts";
import { parseResume } from "./resume.ts";
import type { About, Job, Project, Resume, SiteData } from "./types.ts";

const ROOT = process.cwd();
export const PUBLIC_ASSETS_DIR = path.join(ROOT, "public", "assets");
export const RESUME_TEX = path.join(PUBLIC_ASSETS_DIR, "ben_tan_resume.tex");
export const PROJECTS_JSON = path.join(PUBLIC_ASSETS_DIR, "projects.json");
export const ABOUT_JSON = path.join(PUBLIC_ASSETS_DIR, "about.json");
export const PREVIEW_DIR = path.join(ROOT, "public", "previews");
export const PREVIEW_META = path.join(ROOT, ".cache", "previews.json");

/** Optional per-project overrides and extra projects, keyed by name. */
export type ProjectOverride = {
  name: string;
  url?: string;
  repo?: string;
  /** An http(s) URL, or a file name inside public/assets/. */
  image?: string;
  description?: string;
  stack?: string[];
  tag?: string;
  hidden?: boolean;
};

export type PreviewMeta = Record<string, { title?: string; description?: string }>;

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const normalizeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]/g, "");

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function loadResume(): Resume {
  return parseResume(readFileSync(RESUME_TEX, "utf8"));
}

export function loadOverrides(): ProjectOverride[] {
  const raw = readJson<{ projects?: ProjectOverride[] } | ProjectOverride[]>(PROJECTS_JSON, []);
  const list = Array.isArray(raw) ? raw : (raw.projects ?? []);
  return list.filter((p) => p && typeof p.name === "string");
}

/** The Home window's About me section, from public/assets/about.json; absent if the file is missing or empty. */
export function loadAbout(): About | undefined {
  const raw = readJson<Partial<About>>(ABOUT_JSON, {});
  const intro = typeof raw.intro === "string" ? raw.intro.trim() : "";
  const skills = (raw.skills ?? []).filter((g) => g && typeof g.label === "string" && g.items?.length);
  const photo = resolveAsset(raw.photo);
  return intro || skills.length || photo ? { photo, intro, skills } : undefined;
}

/** An http(s) URL as is, or a file name inside public/assets/ as its public path (if the file exists). */
function resolveAsset(ref: string | undefined): string | undefined {
  if (!ref) return undefined;
  if (/^https?:\/\//.test(ref)) return ref;
  const file = path.basename(ref);
  return existsSync(path.join(PUBLIC_ASSETS_DIR, file)) ? `/assets/${file}` : undefined;
}

const DOMAIN_RE = /^[\w-]+(\.[\w-]+)+(\/\S*)?$/;

/** Projects from the resume, merged with public/assets/projects.json (which wins on conflicts). */
export function loadProjects(resume: Resume = loadResume()): Project[] {
  const overrides = loadOverrides();
  const used = new Set<ProjectOverride>();

  const fromResume = resume.sections
    .flatMap((s) => s.entries)
    .filter((e) => e.kind === "project")
    .map((entry): Project => {
      const [namePart, ...stackParts] = plain(entry.title).split(/\s+\|\s+/);
      const paren = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(namePart);
      const name = (paren ? paren[1] : namePart).trim();
      const note = paren?.[2].trim();
      const href = entry.title.find((s) => s.href)?.href;

      const project: Project = {
        slug: slugify(name),
        name,
        tag: note && !DOMAIN_RE.test(note) ? note : undefined,
        url: href ?? (note && DOMAIN_RE.test(note) ? `https://${note}` : undefined),
        stack: stackParts
          .join(", ")
          .split(/\s*,\s*/)
          .filter(Boolean),
        bullets: entry.bullets,
      };

      const key = normalizeName(name);
      const o = overrides.find((p) => {
        const k = normalizeName(p.name);
        return k === key || k.startsWith(key) || key.startsWith(k);
      });
      if (o) {
        used.add(o);
        return applyOverride(project, o);
      }
      return project;
    });

  const extras = overrides
    .filter((o) => !used.has(o))
    .map((o) => applyOverride({ slug: slugify(o.name), name: o.name, stack: [], bullets: [] }, o));

  return [...fromResume, ...extras].filter(
    (p) => !overrides.find((o) => o.hidden && normalizeName(o.name) === normalizeName(p.name)),
  );
}

function applyOverride(p: Project, o: ProjectOverride): Project {
  return {
    ...p,
    url: o.url ?? p.url,
    repo: o.repo ?? p.repo,
    description: o.description ?? p.description,
    stack: o.stack?.length ? o.stack : p.stack,
    tag: o.tag ?? p.tag,
    preview: o.image,
  };
}

function resolvePreview(p: Project): string | undefined {
  const custom = resolveAsset(p.preview);
  if (custom) return custom;
  const candidates = ["png", "jpg", "jpeg", "webp"].map((ext) => `${p.slug}.${ext}`);
  const hit = candidates.find((file) => existsSync(path.join(PREVIEW_DIR, file)));
  return hit ? `/previews/${hit}` : undefined;
}

function currentJob(resume: Resume): Job | undefined {
  const section = resume.sections.find((s) => /experience|employment|work/i.test(s.title) && !/project/i.test(s.title));
  const e = section?.entries.find((x) => x.kind === "subheading");
  if (!e) return undefined;
  return { role: plain(e.title), company: plain(e.subtitle), dates: plain(e.date), location: plain(e.location) };
}

export function loadSiteData(): SiteData {
  const resume = loadResume();
  const meta = readJson<PreviewMeta>(PREVIEW_META, {});
  const projects = loadProjects(resume).map((p) => ({
    ...p,
    description: p.description ?? meta[p.slug]?.description,
    preview: resolvePreview(p),
  }));
  const current = currentJob(resume);
  return {
    resume,
    projects,
    current,
    about: loadAbout(),
    headline: current ? `${current.role} at ${current.company}` : "Software Engineer",
  };
}
