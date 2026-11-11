import { cn } from "cn";
import { useState } from "react";
import type { MouseEvent } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";

const STANZA_BREAK = /\n\s*\n/;

const SECTION_MEANINGS: Record<string, string> = {
  Antistrophe:
    "The “counter-turn.” Same pattern as the strophe, sung as the chorus moved back the other way.",
  Epode:
    "The “after-song.” A closing section in a different pattern, sung with the chorus standing still.",
  Strophe:
    "The “turn.” The opening section, which a Greek chorus sang while moving one way across the stage.",
};

type OdeSectionLabelProps = {
  name: string;
};

const OdeSectionLabel = ({ name }: OdeSectionLabelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsOpen(true);
  };

  return (
    <Tooltip onOpenChange={setIsOpen} open={isOpen}>
      <TooltipTrigger
        className="text-muted-foreground mb-1 cursor-help rounded-sm font-sans text-xs font-semibold tracking-[0.08em] uppercase underline decoration-dotted underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-3"
        onClick={handleClick}
      >
        {name}
      </TooltipTrigger>
      <TooltipContent>{SECTION_MEANINGS[name]}</TooltipContent>
    </Tooltip>
  );
};

const toStanzas = (ode: string) =>
  ode.split(STANZA_BREAK).map((stanza) => {
    const lines = stanza.split("\n");
    const firstLine = lines[0].trim();

    return SECTION_MEANINGS[firstLine]
      ? { lines: lines.slice(1), section: firstLine }
      : { lines, section: undefined };
  });

type OdeVerseProps = {
  className?: string;
  ode: string;
};

const OdeVerse = ({ className, ode }: OdeVerseProps) => (
  <div
    className={cn("font-verse text-lg leading-[1.55] sm:text-xl", className)}
  >
    {toStanzas(ode).map(({ lines, section }, stanzaIndex) => (
      <p className="mt-[1.1em] first:mt-0" key={`${stanzaIndex}-${lines[0]}`}>
        {section && <OdeSectionLabel name={section} />}
        {lines.map((line, lineIndex) => (
          <span className="block pl-6 -indent-6" key={`${lineIndex}-${line}`}>
            {line}
          </span>
        ))}
      </p>
    ))}
  </div>
);

export default OdeVerse;
