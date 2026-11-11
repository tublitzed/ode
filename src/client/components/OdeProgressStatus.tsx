import { cn } from "cn";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const DEFAULT_INTERVAL_MS = 2400;
const TILE_COUNT = 12;
const TILE_COLORS = [
  "#A8352A",
  "#E3BA47",
  "#2A2522",
  "#7AA6C7",
  "#C06A27",
  "#8EAE63",
];

const DEFAULT_PHRASES = [
  "Consulting the muses…",
  "Sketching on wet mortar…",
  "Sorting the tiles by color…",
  "Breaking lines in unexpected places…",
  "Searching for the perfect image…",
  "Polishing a stanza…",
];

const tileStyle = (index: number) =>
  ({
    "--tilt": `${((index * 37) % 9) - 4}deg`,
    animationDelay: `${index * 90}ms`,
    backgroundColor: TILE_COLORS[(index * 5) % TILE_COLORS.length],
  }) as CSSProperties;

type OdeProgressStatusProps = {
  align?: "center" | "start";
  hasTiles?: boolean;
  intervalMs?: number;
  label?: string;
  phrases?: string[];
  tone?: "accent" | "quiet";
};

const OdeProgressStatus = ({
  align = "center",
  hasTiles = true,
  intervalMs = DEFAULT_INTERVAL_MS,
  label = "Writing your ode.",
  phrases = DEFAULT_PHRASES,
  tone = "quiet",
}: OdeProgressStatusProps) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (phrases.length < 2) {
      return;
    }

    const interval = setInterval(() => {
      setPhraseIndex((index) => (index + 1) % phrases.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, phrases.length]);

  return (
    <output
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center" : "items-start",
      )}
    >
      <span className="sr-only">{label}</span>
      {hasTiles && (
        <span aria-hidden className="flex gap-1">
          {Array.from({ length: TILE_COUNT }, (_, index) => (
            <i
              className="animate-lay size-3.5 rounded-[2px] opacity-0 motion-reduce:animate-none motion-reduce:opacity-100"
              key={index}
              style={tileStyle(index)}
            />
          ))}
        </span>
      )}
      <span
        aria-hidden
        className={
          tone === "quiet"
            ? "font-verse text-muted-foreground min-h-[3em] max-w-[40ch] text-lg leading-normal text-balance"
            : "text-destructive min-h-6 font-medium text-balance"
        }
      >
        {phrases[phraseIndex % phrases.length]}
      </span>
    </output>
  );
};

export default OdeProgressStatus;
