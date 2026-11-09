import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

const DEFAULT_INTERVAL_MS = 2000;

const DEFAULT_PHRASES = [
  "Consulting the muses…",
  "Sharpening the quill…",
  "Admiring your subject…",
  "Breaking lines in unexpected places…",
  "Searching for the perfect image…",
  "Polishing a stanza…",
];

type OdeProgressStatusProps = {
  intervalMs?: number;
  phrases?: string[];
};

const OdeProgressStatus = ({
  intervalMs = DEFAULT_INTERVAL_MS,
  phrases = DEFAULT_PHRASES,
}: OdeProgressStatusProps) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((index) => (index + 1) % phrases.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, phrases.length]);

  return (
    <output className="flex items-center gap-2 text-sm">
      <span className="sr-only">Writing your ode.</span>
      <LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:animate-none" />
      <span aria-hidden className="text-muted-foreground">
        {phrases[phraseIndex]}
      </span>
    </output>
  );
};

export default OdeProgressStatus;
