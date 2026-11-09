import MosaicPanel from "@/client/components/MosaicPanel";
import OdeTitle from "@/client/components/OdeTitle";
import { Button } from "@/client/components/ui/button";

type OdeDeclinedProps = {
  onEnterDifferentTopic: () => void;
  onSelectSuggestion: (suggestion: string) => void;
  reason: string;
  suggestions: string[];
};

const OdeDeclined = ({
  onEnterDifferentTopic,
  onSelectSuggestion,
  reason,
  suggestions,
}: OdeDeclinedProps) => (
  <>
    <MosaicPanel
      className="max-w-100"
      label="An empty mosaic"
      state="waiting"
    />
    <OdeTitle className="mt-10">We can’t write that ode</OdeTitle>
    <p className="text-muted-foreground mt-3 max-w-[44ch] text-lg leading-normal text-balance">
      {reason}
    </p>
    <p className="mt-8 font-semibold">How about one of these?</p>
    <div className="mt-3 flex flex-wrap justify-center gap-3">
      {suggestions.map((suggestion) => (
        <Button
          className="h-auto whitespace-normal"
          key={suggestion}
          onClick={() => onSelectSuggestion(suggestion)}
          variant="outline"
        >
          {suggestion}
        </Button>
      ))}
    </div>
    <Button className="mt-4" onClick={onEnterDifferentTopic} variant="ghost">
      Enter a different topic
    </Button>
  </>
);

export default OdeDeclined;
