"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { EventLetter, LetterPhoto } from "@/lib/types";
import styles from "./letter.module.css";

type Stage = "sealed" | "opening" | "open";
type BurstHeart = { id: number; dx: number; dy: number; rot: number; size: number; delay: number; color: string };
type Burst = { x: number; y: number; hearts: BurstHeart[] };

/** Flap, then paper, then fade: matches the delays in letter.module.css. */
const OPEN_MS = 1700;
const BURST_MS = 1900;
const BURST_COLORS = ["#e4637f", "#f29bb0", "#bf3f5d", "#f7c1ce", "#ff8fa3"];
const SHAPES = [styles.blobA, styles.blobB, styles.blobC];

// Hearts drifting up behind everything. Fixed values so the server and client render the same markup.
const FLOATERS = [
  { left: 4, size: 14, delay: 0, dur: 15 },
  { left: 13, size: 22, delay: 6, dur: 19 },
  { left: 22, size: 12, delay: 11, dur: 14 },
  { left: 31, size: 18, delay: 3, dur: 17 },
  { left: 42, size: 10, delay: 9, dur: 13 },
  { left: 51, size: 24, delay: 14, dur: 21 },
  { left: 60, size: 13, delay: 1, dur: 16 },
  { left: 69, size: 19, delay: 8, dur: 18 },
  { left: 77, size: 11, delay: 4, dur: 14 },
  { left: 85, size: 21, delay: 12, dur: 20 },
  { left: 93, size: 15, delay: 6, dur: 15 },
];

const vars = (v: Record<string, string | number>) => v as CSSProperties;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Heart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );
}

function Photo({ photo, index }: { photo: LetterPhoto; index: number }) {
  const side = index % 2 ? styles.photoRight : styles.photoLeft;
  return (
    <figure
      data-reveal
      className={`${styles.photo} ${side} ${SHAPES[index % SHAPES.length]}`}
      style={vars({ "--tilt": `${index % 2 ? 3 : -3}deg` })}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        width={768}
        height={1024}
        loading="lazy"
        decoding="async"
        style={{ aspectRatio: photo.aspect, objectPosition: photo.position }}
      />
    </figure>
  );
}

export function Letter({ letter }: { letter: EventLetter }) {
  const [stage, setStage] = useState<Stage>("sealed");
  const [tries, setTries] = useState(0);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [answered, setAnswered] = useState(false);
  const [burst, setBurst] = useState<Burst | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLElement>(null);
  const greetingRef = useRef<HTMLHeadingElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);
  const proposalRef = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const open = () => {
    if (stage !== "sealed") return;
    if (reducedMotion()) {
      setStage("open");
      return;
    }
    setStage("opening");
    later(() => setStage("open"), OPEN_MS);
  };

  // Once the letter is out: start at the top, move focus into it, and fade paragraphs in as they scroll into view.
  useEffect(() => {
    if (stage !== "open") return;
    scrollerRef.current?.scrollTo({ top: 0 });
    greetingRef.current?.focus({ preventScroll: true });

    const items = paperRef.current?.querySelectorAll<HTMLElement>("[data-reveal]") ?? [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-shown", "");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [stage]);

  // The "No" button hops somewhere else inside the choices row every time it is tried.
  const dodge = () => {
    const box = choicesRef.current?.getBoundingClientRect();
    if (!box) return;
    const maxX = Math.max(50, box.width / 2 - 80);
    let next = noOffset;
    for (let i = 0; i < 12 && Math.hypot(next.x - noOffset.x, next.y - noOffset.y) < 70; i++) {
      next = { x: Math.round((Math.random() * 2 - 1) * maxX), y: Math.round((Math.random() * 2 - 1) * 56) };
    }
    setNoOffset(next);
    setTries((t) => t + 1);
  };

  const sayYes = (e: MouseEvent<HTMLButtonElement>) => {
    setAnswered(true);
    const calm = reducedMotion();
    if (!calm) {
      const r = e.currentTarget.getBoundingClientRect();
      const hearts = Array.from({ length: 30 }, (_, id): BurstHeart => {
        const angle = (id / 30) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 90 + Math.random() * 170;
        return {
          id,
          dx: Math.round(Math.cos(angle) * dist),
          dy: Math.round(Math.sin(angle) * dist - 60),
          rot: Math.round(Math.random() * 80 - 40),
          size: Math.round(14 + Math.random() * 22),
          delay: Math.round(Math.random() * 160),
          color: BURST_COLORS[id % BURST_COLORS.length],
        };
      });
      setBurst({ x: r.left + r.width / 2, y: r.top + r.height / 2, hearts });
      later(() => setBurst(null), BURST_MS);
    }
    later(
      () => proposalRef.current?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" }),
      calm ? 0 : 900,
    );
  };

  const readAgain = () => scrollerRef.current?.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });

  let photoIndex = 0;
  const noLabel = letter.noReplies[Math.min(tries, letter.noReplies.length - 1)];

  return (
    <div ref={scrollerRef} className={`${styles.page} ${styles.hand}`}>
      <div className={styles.floaters} aria-hidden="true">
        {FLOATERS.map((f, i) => (
          <span
            key={i}
            className={styles.floater}
            style={vars({
              "--left": `${f.left}%`,
              "--size": `${f.size}px`,
              "--delay": `${f.delay}s`,
              "--dur": `${f.dur}s`,
            })}
          >
            <Heart />
          </span>
        ))}
      </div>

      {stage !== "open" ? (
        <main className={styles.sealed} data-stage={stage}>
          <button
            type="button"
            className={styles.envelope}
            data-stage={stage}
            onClick={open}
            aria-label={`Open the letter${letter.envelope ? `: ${letter.envelope}` : ""}`}
          >
            <span className={styles.envBack} />
            <span className={styles.envPaper}>
              <span className={styles.envPaperLines} />
            </span>
            <span className={styles.envPocket} />
            <span className={styles.envFlapWrap}>
              <span className={styles.envFlap} />
            </span>
            <span className={styles.envSeal}>
              <Heart className={styles.sealHeart} />
            </span>
            {letter.envelope && <span className={styles.envName}>{letter.envelope}</span>}
          </button>
          <p className={styles.hint} aria-hidden="true">
            tap to open
          </p>
        </main>
      ) : (
        <main className={styles.letterWrap}>
          <article ref={paperRef} className={styles.paper} aria-labelledby="letter-greeting">
            <h1 id="letter-greeting" ref={greetingRef} tabIndex={-1} className={styles.greeting}>
              {letter.greeting}
            </h1>
            {letter.paragraphs.map((text, i) => (
              <Fragment key={i}>
                <p data-reveal className={styles.para}>
                  {text}
                </p>
                {letter.photos
                  .filter((p) => p.after === i)
                  .map((p) => (
                    <Photo key={p.src} photo={p} index={photoIndex++} />
                  ))}
              </Fragment>
            ))}
            {letter.closing && (
              <p data-reveal className={styles.closing}>
                {letter.closing}
              </p>
            )}
            {letter.signature && (
              <p data-reveal className={styles.signature}>
                {letter.signature}
              </p>
            )}
          </article>

          {letter.question && (
            <section className={styles.ask} aria-labelledby="letter-question">
              <h2 id="letter-question" className={styles.question}>
                {letter.question}
              </h2>
              {answered ? (
                <p className={styles.yay} role="status">
                  <Heart className={styles.yayHeart} />
                  <Heart className={styles.yayHeart} />
                  <Heart className={styles.yayHeart} />
                  <span className="sr-only">Yes!</span>
                </p>
              ) : (
                <div ref={choicesRef} className={styles.choices}>
                  <button
                    type="button"
                    className={styles.yes}
                    style={vars({ "--grow": Math.min(1 + tries * 0.12, 1.8) })}
                    onClick={sayYes}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={styles.no}
                    style={vars({ "--x": `${noOffset.x}px`, "--y": `${noOffset.y}px` })}
                    onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
                    onClick={dodge}
                  >
                    {noLabel}
                  </button>
                </div>
              )}
            </section>
          )}

          {answered && letter.proposal && (
            <section
              ref={proposalRef}
              className={styles.proposal}
              aria-label={letter.proposal.caption || "The night I asked"}
            >
              <figure className={styles.polaroid}>
                <img src={letter.proposal.src} alt={letter.proposal.alt} width={768} height={1024} />
                <figcaption>
                  {letter.proposal.date && <span className={styles.polaroidDate}>{letter.proposal.date}</span>}
                  {letter.proposal.caption && <span className={styles.polaroidCaption}>{letter.proposal.caption}</span>}
                </figcaption>
              </figure>
              <button type="button" className={styles.again} onClick={readAgain}>
                read it again ↑
              </button>
            </section>
          )}
        </main>
      )}

      {burst && (
        <div className={styles.burst} style={vars({ "--x": `${burst.x}px`, "--y": `${burst.y}px` })} aria-hidden="true">
          {burst.hearts.map((h) => (
            <span
              key={h.id}
              className={styles.burstHeart}
              style={vars({
                "--dx": `${h.dx}px`,
                "--dy": `${h.dy}px`,
                "--rot": `${h.rot}deg`,
                "--size": `${h.size}px`,
                "--delay": `${h.delay}ms`,
                "--c": h.color,
              })}
            >
              <Heart />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
