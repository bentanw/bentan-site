"use client";

import { useEffect } from "react";

// Displacement map for the refraction filter: red encodes x-offset, blue y-offset, with a
// neutral grey core so only the rim of each glass element bends what's behind it.
const MAP = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
<defs>
<linearGradient id="r" x1="0" x2="1"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#000"/></linearGradient>
<linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00f"/><stop offset="1" stop-color="#000"/></linearGradient>
<filter id="f"><feGaussianBlur stdDeviation="5"/></filter>
</defs>
<rect width="100" height="100" fill="#000"/>
<rect width="100" height="100" fill="url(#r)"/>
<rect width="100" height="100" fill="url(#b)" style="mix-blend-mode:screen"/>
<rect x="9" y="9" width="82" height="82" rx="14" fill="#808080" filter="url(#f)"/>
</svg>`)}`;

/**
 * SVG filter used as a backdrop-filter for the lens-like edge of Liquid Glass. Only Chromium
 * supports url() filters on backdrop-filter, so the `refract` class is added just there and every
 * other browser keeps the plain frosted blur.
 */
export function GlassDefs() {
  useEffect(() => {
    const chromium = "chrome" in window && !/Firefox/.test(navigator.userAgent);
    document.documentElement.classList.toggle("refract", chromium);
    return () => document.documentElement.classList.remove("refract");
  }, []);

  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="lg-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feImage href={MAP} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="28" xChannelSelector="R" yChannelSelector="B" />
      </filter>
    </svg>
  );
}
