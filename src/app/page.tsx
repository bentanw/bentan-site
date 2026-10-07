import { Desktop } from "@/components/Desktop";
import { loadSiteData } from "@/lib/site-data";

// Reads public/assets/ben_tan_resume.tex + public/assets/projects.json on each render in dev
// (refresh to see edits) and once at build time.
export default function Page() {
  return <Desktop data={loadSiteData()} />;
}
