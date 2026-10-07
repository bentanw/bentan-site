"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";
import { COLORS } from "@/lib/constants/colors";

/** Slowly flowing blue mesh gradient in the spirit of the Tahoe wallpaper (Paper Shaders). Holds still for reduced motion. */
export function Wallpaper() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStill(mq.matches);
  }, []);

  return (
    <div className="absolute inset-0 bg-mac-desktop">
      <MeshGradient
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
        colors={[...COLORS.macWallpaper]}
        distortion={0.8}
        swirl={0.4}
        grainOverlay={0.06}
        speed={still ? 0 : 0.18}
        maxPixelCount={1920 * 1080}
      />
    </div>
  );
}
