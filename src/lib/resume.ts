// Parses a resume written with Jake Gutierrez's LaTeX template (\resumeSubheading,
// \resumeProjectHeading, \resumeItem, …) into structured data.

import { parseInline, plain, readArg, readArgs, stripComments } from "./latex.ts";
import type { Resume, ResumeEntry, ResumeSection, Rich } from "./types.ts";

const ENTRY_MACROS: Record<string, { kind: ResumeEntry["kind"]; args: number }> = {
  resumeSubheading: { kind: "subheading", args: 4 },
  resumeSubSubheading: { kind: "subheading", args: 2 },
  resumeProjectHeading: { kind: "project", args: 2 },
};
const ITEM_MACROS = new Set(["resumeItem", "resumeSubItem"]);
const MACRO_RE = /\\(resumeSubheading|resumeSubSubheading|resumeProjectHeading|resumeItem|resumeSubItem)(?![a-zA-Z])/g;

export function parseResume(tex: string): Resume {
  const src = stripComments(tex);
  const begin = src.indexOf("\\begin{document}");
  const end = src.indexOf("\\end{document}");
  const body = src.slice(begin === -1 ? 0 : begin + "\\begin{document}".length, end === -1 ? undefined : end);

  const firstSection = body.search(/\\section\*?\s*\{/);
  const headerSrc = firstSection === -1 ? body : body.slice(0, firstSection);
  const { name, contact } = parseHeader(headerSrc);

  const sections: ResumeSection[] = [];
  const sectionRe = /\\section\*?\s*(?=\{)/g;
  const starts: { title: string; from: number; at: number }[] = [];
  for (let m; (m = sectionRe.exec(body));) {
    const r = readArg(body, m.index + m[0].length);
    if (!r) continue;
    starts.push({ title: plain(parseInline(r[0])), from: r[1], at: m.index });
  }
  starts.forEach((s, k) => {
    const content = body.slice(s.from, starts[k + 1]?.at ?? body.length);
    sections.push(parseSection(s.title, content));
  });

  return { name, contact, sections };
}

function parseHeader(src: string): { name: string; contact: Resume["contact"] } {
  // The name is the first bold/large run in the header block.
  const nameMatch = /\\textbf\s*\{/.exec(src);
  let name = "";
  let rest = src;
  if (nameMatch) {
    const r = readArg(src, nameMatch.index + "\\textbf".length);
    if (r) {
      name = plain(parseInline(r[0]));
      rest = src.slice(r[1]);
    }
  }
  const header = parseInline(rest.replace(/\\(begin|end)\{center\}/g, ""));
  const text = plain(header);
  const hrefs = header.map((s) => s.href).filter((h): h is string => !!h);

  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? hrefs.find((h) => h.startsWith("mailto:"))?.slice(7);
  const phone = text.match(/\+?\d[\d\s().-]{7,}\d/)?.[0].trim();
  const linkedin =
    hrefs.find((h) => h.includes("linkedin.com")) ?? withScheme(text.match(/linkedin\.com\/in\/[\w-]+\/?/)?.[0]);
  const github = hrefs.find((h) => h.includes("github.com")) ?? withScheme(text.match(/github\.com\/[\w-]+/)?.[0]);

  return { name, contact: { email, phone, linkedin, github, header } };
}

function withScheme(host?: string) {
  return host ? `https://${host}` : undefined;
}

function parseSection(title: string, content: string): ResumeSection {
  const section: ResumeSection = { title, entries: [], skills: [], bullets: [] };
  let current: ResumeEntry | null = null;

  for (let m; (m = MACRO_RE.exec(content));) {
    const macro = m[1];
    if (ITEM_MACROS.has(macro)) {
      const [[arg], next] = readArgs(content, m.index + m[0].length, 1);
      MACRO_RE.lastIndex = next;
      const item = parseInline(arg);
      if (current) current.bullets.push(item);
      else section.bullets.push(item);
      continue;
    }
    const spec = ENTRY_MACROS[macro];
    const [args, next] = readArgs(content, m.index + m[0].length, spec.args);
    MACRO_RE.lastIndex = next;
    const rich = args.map(parseInline);
    const empty: Rich = [];
    current =
      spec.args === 4
        ? { kind: spec.kind, title: rich[0], date: rich[1], subtitle: rich[2], location: rich[3], bullets: [] }
        : spec.kind === "project"
          ? { kind: spec.kind, title: rich[0], date: rich[1], subtitle: empty, location: empty, bullets: [] }
          : { kind: spec.kind, title: empty, date: empty, subtitle: rich[0], location: rich[1], bullets: [] };
    section.entries.push(current);
  }
  MACRO_RE.lastIndex = 0;

  // Skills-style sections: lines of "\textbf{Label:} a, b, c \\".
  if (!section.entries.length && !section.bullets.length) {
    for (const line of parseInline(content).reduce<Rich[]>(splitLines, [[]])) {
      const label = line
        .find((s) => s.b)
        ?.text.replace(/:\s*$/, "")
        .trim();
      const items = plain(line.filter((s) => !s.b)).replace(/^:\s*/, "");
      if (label && items) section.skills.push({ label, items: items.split(/\s*,\s*/).filter(Boolean) });
      else if (plain(line)) section.bullets.push(line);
    }
  }
  return section;
}

function splitLines(lines: Rich[], seg: Rich[number]): Rich[] {
  const parts = seg.text.split("\n");
  parts.forEach((text, k) => {
    if (k > 0) lines.push([]);
    if (text.trim()) lines[lines.length - 1].push({ ...seg, text });
  });
  return lines;
}
