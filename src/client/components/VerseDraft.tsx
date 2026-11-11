import { useEffect, useState } from "react";

import Sinopia from "@/client/components/Sinopia";

const CYCLE_MS = 9500;
const DRAW_MS = 700;
const LINE_GAP = 18;
const LINE_LENGTHS = [128, 84, 146, 62, 0, 118, 96, 140, 70];
const STAGGER_MS = 780;
const START_X = 47;
const START_Y = 52;
const STANZA_GAP = 12;
const WORD_LENGTH = 5;

const scribble = (y: number, length: number, seed: number) => {
  let d = `M${START_X} ${y}`;
  let x = START_X;
  let step = seed;

  while (x < START_X + length) {
    const width = 5 + ((step * 7) % 4);
    const height = 3 + ((step * 5) % 3);

    if (step % WORD_LENGTH === WORD_LENGTH - 1) {
      d += ` m${width} 0`;
    } else if (step % 7 === 3) {
      d += ` c-1 -${height * 3} ${width + 1} -${height * 3} ${width} 0`;
    } else {
      d += ` q${width / 2} -${height * 2} ${width} 0`;
    }

    x += width;
    step += 1;
  }

  return d;
};

const buildDraft = () => {
  let y = START_Y;

  return LINE_LENGTHS.flatMap((length, index) => {
    if (length === 0) {
      y += STANZA_GAP;
      return [];
    }

    const line = scribble(y, length, index * 3);
    y += LINE_GAP;
    return [line];
  });
};

const DRAFT = buildDraft();

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const VerseDraft = () => {
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    const timer = setInterval(() => setPage((count) => count + 1), CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <Sinopia
      cycleMs={CYCLE_MS}
      drawMs={DRAW_MS}
      key={page}
      paths={DRAFT}
      staggerMs={STAGGER_MS}
      strokeWidth={1.4}
    />
  );
};

export default VerseDraft;
