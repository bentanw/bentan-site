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

/** Hand-written intro and highlighted skills for the Home window. */
export type About = {
  /** Public path of a photo of the site owner, when one exists. */
  photo?: string;
  intro: string;
  skills: { label: string; items: string[] }[];
};

export type SiteData = {
  resume: Resume;
  projects: Project[];
  headline: string;
  current?: Job;
  about?: About;
};

/** A photo placed in an event letter, already resolved to a public path. */
export type LetterPhoto = {
  src: string;
  alt: string;
  /** CSS aspect-ratio to crop to (default 3 / 4). */
  aspect?: string;
  /** CSS object-position for the crop (default centered). */
  position?: string;
};

/** A hand-written letter page under /events/<slug>, from public/assets/events/<slug>/letter.json. */
export type EventLetter = {
  title: string;
  envelope: string;
  greeting: string;
  paragraphs: string[];
  closing: string;
  signature: string;
  /** Photos shown after the paragraph at `after` (0-based). */
  photos: (LetterPhoto & { after: number })[];
  question: string;
  /** Labels the "No" button cycles through each time it is tried. */
  noReplies: string[];
  proposal?: LetterPhoto & { date: string; caption: string };
};
