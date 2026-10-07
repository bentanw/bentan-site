import { Fragment } from "react";
import type { Rich as RichText } from "@/lib/types";

/** Renders text runs parsed from LaTeX (bold/italic/underline/links, `\\` line breaks). */
export function Rich({ value, linkClassName }: { value: RichText; linkClassName?: string }) {
  return (
    <>
      {value.map((seg, k) => {
        let node: React.ReactNode = seg.text.split("\n").map((line, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {line}
          </Fragment>
        ));
        if (seg.u) node = <u>{node}</u>;
        if (seg.i) node = <em>{node}</em>;
        if (seg.b) node = <strong>{node}</strong>;
        if (seg.href) {
          const href = seg.href.includes("@") && !seg.href.startsWith("mailto:") ? `mailto:${seg.href}` : seg.href;
          node = (
            <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
              {node}
            </a>
          );
        }
        return <Fragment key={k}>{node}</Fragment>;
      })}
    </>
  );
}
