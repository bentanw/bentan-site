import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Nanum_Pen_Script } from "next/font/google";
import { COLORS } from "@/lib/constants/colors";
import { loadEventLetter } from "@/lib/site-data";
import { Letter } from "./Letter";

const SLUG = "ask-sylvia-to-be-girlfriend";

// Pen-on-paper handwriting for the letter. Chinese characters fall back to a Kai brush font in letter.module.css.
const hand = Nanum_Pen_Script({ weight: "400", subsets: ["latin"], variable: "--font-hand" });

export function generateMetadata(): Metadata {
  return {
    title: loadEventLetter(SLUG)?.title ?? "A letter",
    // A personal letter: reachable by link, kept out of search results.
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: COLORS.letterTheme,
};

export default function AskSylviaPage() {
  const letter = loadEventLetter(SLUG);
  if (!letter) notFound();
  return (
    <div className={hand.variable}>
      <Letter letter={letter} />
    </div>
  );
}
