import type { Metadata, Viewport } from "next";
import { COLORS } from "@/lib/constants/colors";
import { loadSiteData } from "@/lib/site-data";
import "./globals.css";

export function generateMetadata(): Metadata {
  const { resume, headline } = loadSiteData();
  return {
    title: `${resume.name} · ${headline}`,
    description: `${resume.name} – ${headline}. Projects, resume, and contact.`,
  };
}

export const viewport: Viewport = {
  themeColor: COLORS.browserTheme,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
