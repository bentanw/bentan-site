import type { Metadata } from "next";
import { ResumeDocument } from "@/components/ResumeDocument";
import { loadResume } from "@/lib/site-data";
import { PrintButton } from "./PrintButton";

export function generateMetadata(): Metadata {
  return { title: `${loadResume().name} · Resume` };
}

// Standalone, printable resume page (rendered from public/assets/ben_tan_resume.tex).
export default function ResumePage() {
  const resume = loadResume();
  return (
    <div className="min-h-dvh overflow-auto bg-paper-backdrop px-2 py-4 sm:px-4 sm:py-8">
      <div className="no-print mx-auto mb-4 flex max-w-letter justify-end">
        <PrintButton />
      </div>
      <div className="resume-page mx-auto max-w-letter bg-white px-4 py-5 shadow-lg sm:px-letter-x sm:py-letter-y">
        <ResumeDocument resume={resume} />
      </div>
    </div>
  );
}
