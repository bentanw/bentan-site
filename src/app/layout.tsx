import type { Metadata, Viewport } from "next";
import { COLORS } from "@/lib/constants/colors";
import { loadSiteData } from "@/lib/site-data";
import "./globals.css";

export function generateMetadata(): Metadata {
  const { resume } = loadSiteData();
  return {
    title: `${resume.name} · Software Engineer`,
    description: `${resume.name} – Software Engineer. Projects, resume, and contact.`,
    icons: { icon: "/favicon.jpg", apple: "/favicon.jpg" },
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
