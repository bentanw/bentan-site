// Runs before `dev` and `build`. For every project:
//   - an `image` file named in public/assets/projects.json is served directly from public/assets/
//   - otherwise, if the project has a URL and no screenshot yet, one is captured through the
//     microlink.io screenshot API and saved as public/previews/<slug>.png
// It also caches each site's <title>/<meta description> for the project cards.
// Delete a file in public/previews/ (or pass --refresh) to re-capture it. Never fails the build.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { loadProjects, PREVIEW_DIR, PREVIEW_META, PUBLIC_ASSETS_DIR, type PreviewMeta } from "../src/lib/site-data.ts";

const refresh = process.argv.includes("--refresh");

function readMeta(): PreviewMeta {
  try {
    return JSON.parse(readFileSync(PREVIEW_META, "utf8"));
  } catch {
    return {};
  }
}

async function fetchWithTimeout(url: string, ms: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, redirect: "follow" });
  } finally {
    clearTimeout(t);
  }
}

async function captureScreenshot(url: string, file: string) {
  const api = new URL("https://api.microlink.io/");
  api.searchParams.set("url", url);
  api.searchParams.set("screenshot", "true");
  api.searchParams.set("meta", "false");
  api.searchParams.set("viewport.width", "1280");
  api.searchParams.set("viewport.height", "800");
  api.searchParams.set("viewport.deviceScaleFactor", "1");
  const res = await fetchWithTimeout(api.toString(), 60_000);
  const body = (await res.json()) as { status: string; data?: { screenshot?: { url?: string } } };
  const shot = body.data?.screenshot?.url;
  if (body.status !== "success" || !shot) throw new Error(`microlink: ${body.status}`);
  const img = await fetchWithTimeout(shot, 60_000);
  writeFileSync(file, Buffer.from(await img.arrayBuffer()));
}

async function fetchPageMeta(url: string) {
  const res = await fetchWithTimeout(url, 15_000);
  const html = await res.text();
  const pick = (re: RegExp) => re.exec(html)?.[1]?.trim();
  const decode = (s?: string) =>
    s
      ?.replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  return {
    title: decode(pick(/<title[^>]*>([^<]*)<\/title>/i)),
    description: decode(
      pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i) ??
        pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i),
    ),
  };
}

async function main() {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  mkdirSync(path.dirname(PREVIEW_META), { recursive: true });
  const meta = readMeta();

  for (const p of loadProjects()) {
    try {
      if (p.preview && !/^https?:\/\//.test(p.preview)) {
        const src = path.join(PUBLIC_ASSETS_DIR, path.basename(p.preview));
        if (!existsSync(src)) console.warn(`[previews] ${p.name}: image "${p.preview}" not found in public/assets/`);
      }
      if (!p.url) continue;

      if (refresh || !meta[p.slug]) {
        meta[p.slug] = await fetchPageMeta(p.url).catch(() => ({}));
      }

      const file = path.join(PREVIEW_DIR, `${p.slug}.png`);
      if (!p.preview && (refresh || !existsSync(file))) {
        console.log(`[previews] capturing ${p.url}`);
        await captureScreenshot(p.url, file);
      }
    } catch (err) {
      console.warn(`[previews] ${p.name}: ${(err as Error).message} (card will use a generated cover)`);
    }
  }

  writeFileSync(PREVIEW_META, JSON.stringify(meta, null, 2));
}

main().catch((err) => console.warn(`[previews] skipped: ${(err as Error).message}`));
