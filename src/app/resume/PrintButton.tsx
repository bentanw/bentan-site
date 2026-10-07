"use client";

import { useEffect } from "react";

export function PrintButton() {
  // /resume?print opens the print dialog straight away (used by the Resume window's Print button).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("print")) window.print();
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="cursor-pointer rounded-md border border-black/20 bg-white px-4 py-1.5 text-sm shadow-sm hover:bg-black/5"
    >
      Print / Save as PDF
    </button>
  );
}
