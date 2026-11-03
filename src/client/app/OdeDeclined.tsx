import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  <Card className="w-full">
    <CardHeader>
      <CardTitle>We can't write that ode</CardTitle>
      <CardDescription>{reason}</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-2">
      <p className="text-sm font-medium">How about one of these?</p>
      {suggestions.map((suggestion) => (
        <Button
          className="h-auto w-full whitespace-normal"
          key={suggestion}
          onClick={() => onSelectSuggestion(suggestion)}
          variant="outline"
        >
          {suggestion}
        </Button>
      ))}
      <Button
        className="w-full"
        onClick={onEnterDifferentTopic}
        variant="ghost"
      >
        Enter a different topic
      </Button>
    </CardContent>
  </Card>
);

export default OdeDeclined;
