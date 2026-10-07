// A small LaTeX reader that understands the subset of LaTeX used by resume templates
// (Jake Gutierrez's in particular): balanced-brace arguments, font commands, links, and the
// usual escapes. It is not a TeX engine; unknown commands degrade to their argument text.

import type { Rich, Seg } from "./types.ts";

/** Remove `%` comments, keeping escaped `\%`. */
export function stripComments(src: string) {
  return src
    .split("\n")
    .map((line) => {
      for (let i = 0; i < line.length; i++) {
        if (line[i] === "%" && !isEscaped(line, i)) return line.slice(0, i);
      }
      return line;
    })
    .join("\n");
}

function isEscaped(s: string, i: number) {
  let slashes = 0;
  for (let j = i - 1; j >= 0 && s[j] === "\\"; j--) slashes++;
  return slashes % 2 === 1;
}

/** Read a `{...}` argument starting at or after `i` (whitespace allowed). */
export function readArg(src: string, i: number): [string, number] | null {
  let j = i;
  while (j < src.length && /\s/.test(src[j])) j++;
  if (src[j] !== "{") return null;
  let depth = 0;
  for (let k = j; k < src.length; k++) {
    const c = src[k];
    if (c === "\\") {
      k++;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return [src.slice(j + 1, k), k + 1];
  }
  return null;
}

/** Read `n` consecutive arguments; missing ones come back as "". */
export function readArgs(src: string, i: number, n: number): [string[], number] {
  const args: string[] = [];
  let pos = i;
  for (let k = 0; k < n; k++) {
    const r = readArg(src, pos);
    if (!r) {
      args.push("");
      continue;
    }
    args.push(r[0]);
    pos = r[1];
  }
  return [args, pos];
}

type Style = Omit<Seg, "text">;

const IGNORED = new Set([
  "tiny",
  "scriptsize",
  "footnotesize",
  "small",
  "normalsize",
  "large",
  "Large",
  "LARGE",
  "huge",
  "Huge",
  "scshape",
  "bfseries",
  "itshape",
  "mdseries",
  "upshape",
  "rmfamily",
  "sffamily",
  "ttfamily",
  "centering",
  "raggedright",
  "raggedleft",
  "noindent",
  "item",
  "hfill",
  "newline",
  "linebreak",
  "par",
  "medskip",
  "smallskip",
  "bigskip",
  "titlerule",
  "vcenter",
  "hbox",
]);
const SKIP_ONE_ARG = new Set(["vspace", "hspace", "label", "color", "setlength", "addtolength"]);
const SYMBOLS: Record<string, string> = {
  textgreater: ">",
  textless: "<",
  textbar: "|",
  textasciitilde: "~",
  textbullet: "•",
  ldots: "…",
  dots: "…",
  textendash: "–",
  textemdash: "—",
  LaTeX: "LaTeX",
  TeX: "TeX",
  textbackslash: "\\",
  textdollar: "$",
  textpercent: "%",
  ampersand: "&",
  copyright: "©",
};
const MATH: Record<string, string> = {
  sim: "~",
  bullet: "•",
  cdot: "·",
  times: "×",
  rightarrow: "→",
  to: "→",
  leftarrow: "←",
  approx: "≈",
  geq: "≥",
  leq: "≤",
  pm: "±",
  vert: "|",
  mid: "|",
};

/** Convert inline LaTeX to styled text runs. */
export function parseInline(src: string): Rich {
  const out: Seg[] = [];
  walk(src, {}, out);
  return normalize(out);
}

function push(out: Seg[], text: string, style: Style) {
  if (text) out.push({ text, ...style });
}

function walk(src: string, style: Style, out: Seg[]) {
  let i = 0;
  while (i < src.length) {
    const c = src[i];

    if (c === "\\") {
      const next = src[i + 1] ?? "";
      if (!/[a-zA-Z]/.test(next)) {
        // Control symbol: \\ is a line break; \%, \&, \$ … and stray ones like \3 are literal.
        if (next === "\\") push(out, "\n", style);
        else if (next === "," || next === " " || next === ";") push(out, " ", style);
        else if (next) push(out, next, style);
        i += 2;
        continue;
      }
      let j = i + 1;
      while (j < src.length && /[a-zA-Z]/.test(src[j])) j++;
      const cmd = src.slice(i + 1, j);
      i = j;
      if (src[i] === "*") i++;

      if (cmd === "begin" || cmd === "end") {
        // Environment markers carry no text; also drop an optional [..] after \begin{..}.
        const r = readArg(src, i);
        if (r) i = r[1];
        const opt = /^\s*\[[^\]]*\]/.exec(src.slice(i));
        if (opt) i += opt[0].length;
      } else if (cmd === "href") {
        const [[url, body], end] = readArgs(src, i, 2);
        walk(body, url.trim() ? { ...style, href: url.trim() } : style, out);
        i = end;
      } else if (cmd === "url") {
        const r = readArg(src, i);
        if (r) {
          push(out, r[0], { ...style, href: r[0] });
          i = r[1];
        }
      } else if (cmd === "textbf" || cmd === "textit" || cmd === "emph" || cmd === "underline") {
        const r = readArg(src, i);
        if (r) {
          const key = cmd === "textbf" ? "b" : cmd === "underline" ? "u" : "i";
          walk(r[0], { ...style, [key]: true }, out);
          i = r[1];
        }
      } else if (cmd in SYMBOLS) {
        push(out, SYMBOLS[cmd], style);
        // `\LaTeX{}` style empty group.
        if (src.startsWith("{}", i)) i += 2;
      } else if (SKIP_ONE_ARG.has(cmd)) {
        const r = readArg(src, i);
        if (r) i = r[1];
      } else if (!IGNORED.has(cmd)) {
        // Unknown command: keep its first argument's text, if any.
        const r = readArg(src, i);
        if (r && !/^\s/.test(src.slice(i, i + 1))) {
          walk(r[0], style, out);
          i = r[1];
        }
      }
      continue;
    }

    if (c === "{") {
      const r = readArg(src, i);
      if (r) {
        walk(r[0], style, out);
        i = r[1];
        continue;
      }
    }

    if (c === "}") {
      i++;
      continue;
    }

    if (c === "$") {
      const end = src.indexOf("$", i + 1);
      const body = end === -1 ? src.slice(i + 1) : src.slice(i + 1, end);
      push(out, mathText(body), style);
      i = end === -1 ? src.length : end + 1;
      continue;
    }

    if (c === "~") {
      push(out, " ", style);
      i++;
      continue;
    }

    if (src.startsWith("---", i)) {
      push(out, "—", style);
      i += 3;
      continue;
    }
    if (src.startsWith("--", i)) {
      push(out, "–", style);
      i += 2;
      continue;
    }
    if (src.startsWith("``", i) || src.startsWith("''", i)) {
      push(out, src[i] === "`" ? "“" : "”", style);
      i += 2;
      continue;
    }

    // Plain text up to the next special character.
    let j = i;
    while (j < src.length && !"\\{}$~-`'".includes(src[j])) j++;
    if (j === i) j = i + 1;
    push(out, src.slice(i, j).replace(/\s+/g, " "), style);
    i = j;
  }
}

function mathText(body: string) {
  return body
    .replace(/\\([a-zA-Z]+)/g, (_, name: string) => MATH[name] ?? "")
    .replace(/[{}^_]/g, "")
    .trim();
}

function sameStyle(a: Seg, b: Seg) {
  return !!a.b === !!b.b && !!a.i === !!b.i && !!a.u === !!b.u && a.href === b.href;
}

function normalize(segs: Seg[]): Rich {
  const merged: Seg[] = [];
  for (const s of segs) {
    const last = merged.at(-1);
    if (last && sameStyle(last, s)) last.text += s.text;
    else merged.push({ ...s });
  }
  // Collapse whitespace across run boundaries and trim the ends.
  let prevSpace = true;
  for (const s of merged) {
    s.text = s.text.replace(/[ \t\r]+/g, " ").replace(/ *\n */g, "\n");
    if (prevSpace) s.text = s.text.replace(/^ +/, "");
    if (s.text) prevSpace = /[ \n]$/.test(s.text);
  }
  const first = merged.find((s) => s.text);
  if (first) first.text = first.text.replace(/^\s+/, "");
  const last = merged.at(-1);
  if (last) last.text = last.text.replace(/\s+$/, "");
  return merged.filter((s) => s.text);
}

export function plain(rich: Rich) {
  return rich
    .map((s) => s.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
