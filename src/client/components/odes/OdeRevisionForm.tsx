import { useEffect, useRef } from "react";
import type { SubmitEvent } from "react";

import OdeProgressStatus from "@/client/components/odes/OdeProgressStatus";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { MAX_CHANGE_REQUEST_LENGTH } from "@/shared/ode";

const PHRASE_INTERVAL_MS = 4500;

const REVISING_PHRASES = [
  "Taking your notes to the poet...",
  "Crossing out a line or two...",
  "Sharpening the quill again...",
  "Reworking a stanza...",
  "Checking the rhymes still land...",
];

type OdeRevisionFormProps = {
  changeRequest: string;
  error?: string;
  isRevising: boolean;
  onChangeRequestChange: (changeRequest: string) => void;
  onSubmit: () => void;
};

const OdeRevisionForm = ({
  changeRequest,
  error,
  isRevising,
  onChangeRequestChange,
  onSubmit,
}: OdeRevisionFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const wasRevising = useRef(isRevising);

  useEffect(() => {
    const finishedRevising = wasRevising.current && !isRevising;
    wasRevising.current = isRevising;

    const focusIsInForm =
      document.activeElement === document.body ||
      inputRef.current?.form?.contains(document.activeElement);

    if (!finishedRevising || !focusIsInForm) {
      return;
    }

    inputRef.current?.focus();
  }, [isRevising]);

  const isEmpty = !changeRequest.trim();

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      className="mt-10 grid w-full max-w-136 gap-2 text-left"
      onSubmit={handleSubmit}
    >
      <Label className="text-muted-foreground" htmlFor="change-request">
        Any notes for the poet?
      </Label>
      <div className="flex items-end gap-3">
        <Input
          aria-describedby={error ? "change-request-error" : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          className="h-10 text-base"
          disabled={isRevising}
          id="change-request"
          maxLength={MAX_CHANGE_REQUEST_LENGTH}
          name="changeRequest"
          onChange={(event) => onChangeRequestChange(event.target.value)}
          placeholder="Make it sillier, or more sincere"
          ref={inputRef}
          value={changeRequest}
        />
        <Button
          disabled={isRevising || isEmpty}
          disabledReason={
            isRevising
              ? "The poet is still revising."
              : "Write a note for the poet first."
          }
          size="sm"
          type="submit"
          variant="secondary"
        >
          {isRevising ? "Revising…" : "Revise"}
        </Button>
      </div>
      {isRevising && (
        <div className="mt-2">
          <OdeProgressStatus
            align="start"
            hasTiles={false}
            intervalMs={PHRASE_INTERVAL_MS}
            label="Revising your ode."
            phrases={REVISING_PHRASES}
          />
        </div>
      )}
      {error && (
        <p
          className="text-destructive text-sm font-medium"
          id="change-request-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
};

export default OdeRevisionForm;
