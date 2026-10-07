"use client";

import { useState } from "react";
import type { Theme } from "@/lib/theme";
import type { Resume } from "@/lib/types";
import { ContactIcon, GitHubIcon, LinkedInIcon } from "../icons";
import { host } from "./HomeApp";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API is unavailable on insecure origins; fall back to a hidden textarea.
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  }
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function ContactApp({ resume, headline, theme }: { resume: Resume; headline: string; theme: Theme }) {
  const [copied, setCopied] = useState(false);
  const { email = "", linkedin, github } = resume.contact;

  const onCopy = async () => {
    if (await copyText(email)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const profiles = [
    linkedin && { label: "LinkedIn", href: linkedin, Icon: LinkedInIcon },
    github && { label: "GitHub", href: github, Icon: GitHubIcon },
  ].filter((x): x is { label: string; href: string; Icon: typeof GitHubIcon } => !!x);

  return (
    <div
      className={`ui-page flex min-h-full flex-col select-text ${theme === "mac" ? "items-center px-6 pt-8 pb-8" : "gap-3 p-4"}`}
    >
      {theme === "mac" ? (
        <div className="flex flex-col items-center text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-b from-mac-avatar-top to-mac-text-secondary text-3xl font-semibold text-white inset-shadow-highlight">
            {initialsOf(resume.name)}
          </span>
          <h1 className="ui-h mt-3 text-title">{resume.name}</h1>
          <p className="ui-muted text-ui">{headline}</p>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <ContactIcon className="h-10 w-10 shrink-0" />
          <p className="pt-1">
            Want to work together or just say hi?
            <br />
            <span className="ui-muted">Copy my e-mail address or send me a message.</span>
          </p>
        </div>
      )}

      <div className={theme === "mac" ? "mt-6 w-full max-w-100 space-y-3" : "space-y-3"}>
        {/* Labels sit above their values on narrow phones so the address never gets clipped. */}
        <label className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="ui-muted w-16 shrink-0 max-xs:w-full">E-mail</span>
          <input
            readOnly
            value={email}
            onFocus={(e) => e.currentTarget.select()}
            className="ui-field min-w-0 grow outline-none"
          />
          <button type="button" onClick={onCopy} className="ui-btn shrink-0">
            {copied ? "Copied!" : "Copy"}
          </button>
        </label>

        {profiles.map(({ label, href, Icon }) => (
          <div key={label} className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="ui-muted w-16 shrink-0 max-xs:w-full">{label}</span>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="ui-link flex min-w-0 items-center gap-1.5"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{host(href)}</span>
            </a>
          </div>
        ))}
      </div>

      <div className={`mt-auto flex pt-5 ${theme === "mac" ? "w-full max-w-100" : "justify-end"}`}>
        <a href={`mailto:${email}`} className={`ui-btn primary ${theme === "mac" ? "w-full" : ""}`}>
          Contact
        </a>
      </div>
    </div>
  );
}
