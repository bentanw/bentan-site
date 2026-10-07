"use client";

import { LiquidMetal } from "@paper-design/shaders-react";
import { COLORS } from "@/lib/constants/colors";

function monogram(initials: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><text x="200" y="300" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="900" font-size="290" letter-spacing="-16">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** The visitor's initials rendered in liquid metal, à la paper-design/liquid-logo. */
export function LiquidLogo({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <LiquidMetal
      className={className}
      image={monogram(initials)}
      colorBack={COLORS.liquidLogoBack}
      colorTint={COLORS.liquidLogoTint}
      repetition={2}
      softness={0.1}
      shiftRed={0.3}
      shiftBlue={0.3}
      distortion={0.07}
      contour={0.4}
      angle={70}
      shape="none"
      scale={0.95}
      speed={1}
    />
  );
}
