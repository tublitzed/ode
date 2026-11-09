import { useState } from "react";
import type { MouseEvent } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";

const SECTION_LINE = /^(Antistrophe|Epode|Strophe)$/m;

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
        className="text-muted-foreground cursor-help text-xs font-semibold tracking-wide uppercase underline decoration-dotted underline-offset-4"
        onClick={handleClick}
      >
        {name}
      </TooltipTrigger>
      <TooltipContent>{SECTION_MEANINGS[name]}</TooltipContent>
    </Tooltip>
  );
};

type OdeVerseProps = {
  ode: string;
};

const OdeVerse = ({ ode }: OdeVerseProps) => (
  <p className="text-sm whitespace-pre-line">
    {ode
      .split(SECTION_LINE)
      .map((part) =>
        SECTION_MEANINGS[part] ? (
          <OdeSectionLabel key={part} name={part} />
        ) : (
          part
        ),
      )}
  </p>
);

export default OdeVerse;
