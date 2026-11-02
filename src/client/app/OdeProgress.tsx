import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PHRASE_INTERVAL_MS = 2000;

const PHRASES = [
  "Consulting the muses…",
  "Sharpening the quill…",
  "Admiring your subject…",
  "Breaking lines in unexpected places…",
  "Searching for the perfect image…",
  "Polishing a stanza…",
];

type OdeProgressProps = {
  topic: string;
};

const OdeProgress = ({ topic }: OdeProgressProps) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((index) => (index + 1) % PHRASES.length);
    }, PHRASE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="wrap-anywhere">Ode to {topic}</CardTitle>
      </CardHeader>
      <CardContent>
        <output className="flex items-center gap-2 text-sm">
          <span className="sr-only">Writing your ode.</span>
          <LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:animate-none" />
          <span aria-hidden className="text-muted-foreground">
            {PHRASES[phraseIndex]}
          </span>
        </output>
      </CardContent>
    </Card>
  );
};

export default OdeProgress;
