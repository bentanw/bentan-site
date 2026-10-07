<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project guide

## Purpose

This is Ben Tan's desktop-style personal portfolio. It has two user-selectable shells—Windows and macOS/Liquid Glass—over a shared set of draggable application windows. Preserve both themes when changing shared behavior.

## Source-of-truth content

- `public/assets/ben_tan_resume.tex` is the only resume source of truth. Do not read, parse, link to, copy, or otherwise depend on `public/assets/ben_tan_resume.pdf`.
- The server-side parser in `src/lib/resume.ts` and `src/lib/latex.ts` converts the LaTeX resume into the site's contact, experience, skills, and project data.
- `public/assets/projects.json` supplements resume projects with URLs, repositories, descriptions, images, tags, stack overrides, visibility, and projects that are not in the resume.
- Keep personal data out of React components. Load it through `src/lib/site-data.ts`.
- When extending the accepted `projects.json` shape, update `ProjectOverride` in `src/lib/site-data.ts` and document the field in `README.md`.

## Project previews

- `scripts/sync-previews.ts` runs before development and production builds.
- It uses custom images directly from `public/assets/` or captures missing website screenshots into `public/previews/`.
- Screenshot/network failure must remain non-fatal; the UI has a generated-cover fallback.
- Do not refresh or overwrite committed screenshots unless the user asks or the associated project changed. Use `npm run previews -- --refresh` when a refresh is intended.
- Keep `.cache/` ignored. Keep `public/previews/` committed for deterministic static deployments.

## UI architecture

- `src/components/Desktop.tsx` owns global desktop state: theme, windows, focus, minimization, and ambient sound.
- `src/components/Window.tsx` owns shared window behavior. Changes must work in both shells and on narrow screens.
- `src/components/win/` contains Windows-only shell UI.
- `src/components/mac/` contains macOS/Liquid Glass-only shell UI.
- `src/components/apps/` contains theme-aware application content shared by both shells.
- `src/lib/theme.ts` defines the persisted theme identifiers. Do not casually rename them because existing visitors may have the old value in local storage.
- Theme switching must preserve open-window state.

## Visual conventions

- Windows should retain recognizable desktop, Start menu, taskbar, tray, and window-control behavior.
- macOS/Liquid Glass should retain translucent materials, the menu bar, dock, traffic-light controls, and Paper shader visuals.
- Respect `prefers-reduced-motion` for animated visual effects.
- Keep text readable when blur, WebGL, or backdrop-filter is unavailable; glass effects require a usable CSS fallback.
- Preserve keyboard activation, focus indicators, labels, and reduced-screen behavior for desktop icons, project cards, controls, and windows.

## Ambient sound

- Ambient rain is synthesized in `src/lib/ambience.ts`; there is no audio file to maintain.
- Do not attempt autoplay before user interaction. Browser audio policies require an interaction to unlock sound.
- Preserve the visible on/off control in both themes and the saved visitor preference.

## Resume rendering

- `/resume` is a printable HTML rendering of the LaTeX data, not an embedded PDF.
- Resume parsing should degrade gracefully when optional sections or contact fields are absent.
- When changing the LaTeX parser, test it against `public/assets/ben_tan_resume.tex` and inspect the parsed projects as well as the resume page.

## Validation

For normal changes, run:

```bash
npx tsc --noEmit
npm run build
```

Also manually verify both themes when a change touches the desktop, windows, app content, theme persistence, sound controls, or responsive behavior. The app uses `output: "export"`; do not introduce features that require a runtime server unless the deployment model is intentionally changed.

## Formatting and commits

- Run `npm run format` after editing supported source or documentation files.
- Husky's `pre-commit` hook runs Prettier through `lint-staged`; do not bypass it.
- Husky's `commit-msg` hook enforces Conventional Commits through Commitlint.
- Use messages such as `feat: add project preview`, `fix(resume): handle missing link`, or `docs: update setup`.
- Do not create, amend, or push commits unless the user explicitly requests it.
