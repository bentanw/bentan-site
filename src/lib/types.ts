// Shapes shared by the server-side loaders and the client UI. Everything here is plain JSON.

/** A run of inline text parsed out of LaTeX. */
export type Seg = { text: string; b?: boolean; i?: boolean; u?: boolean; href?: string };
export type Rich = Seg[];

export type ResumeEntry = {
  kind: "subheading" | "project";
  title: Rich;
  date: Rich;
  subtitle: Rich;
  location: Rich;
  bullets: Rich[];
};

export type ResumeSection = {
  title: string;
  entries: ResumeEntry[];
  skills: { label: string; items: string[] }[];
  bullets: Rich[];
};

export type Resume = {
  name: string;
  contact: { email?: string; phone?: string; linkedin?: string; github?: string; header: Rich };
  sections: ResumeSection[];
};

export type Project = {
  slug: string;
  name: string;
  /** Short parenthetical from the resume heading, e.g. "App Store". */
  tag?: string;
  url?: string;
  repo?: string;
  stack: string[];
  description?: string;
  bullets: Rich[];
  /** Public path of a screenshot/preview image, when one exists. */
  preview?: string;
};

export type Job = {
  role: string;
  company: string;
  dates: string;
  location: string;
};

export type SiteData = {
  resume: Resume;
  projects: Project[];
  headline: string;
  current?: Job;
};
