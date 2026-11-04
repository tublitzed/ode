import type { SubmitEvent } from "react";

import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { MAX_TOPIC_LENGTH } from "@/shared/ode";

type OdeFormProps = {
  error: string | undefined;
  onSubmit: () => void;
  onTopicChange: (topic: string) => void;
  topic: string;
};

const OdeForm = ({ error, onSubmit, onTopicChange, topic }: OdeFormProps) => {
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Welcome to Ode!</CardTitle>
        <CardDescription>
          Give us a word or phrase to celebrate and we'll generate odes
          together... with Anthropic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="topic">What should this ode celebrate?</Label>
            <Input
              aria-describedby={error ? "topic-error" : undefined}
              autoComplete="off"
              autoFocus
              id="topic"
              maxLength={MAX_TOPIC_LENGTH}
              name="topic"
              onChange={(event) => onTopicChange(event.target.value)}
              placeholder="Tomatoes"
              required
              value={topic}
            />
            {error && (
              <p
                className="text-destructive text-sm"
                id="topic-error"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
          <Button className="w-full" disabled={!topic.trim()} type="submit">
            {error ? "Try again" : "Write my ode"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OdeForm;
