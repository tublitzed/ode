import type { KeyboardEvent, SubmitEvent } from "react";

import OdeProgressStatus from "@/client/components/OdeProgressStatus";
import { Button } from "@/client/components/ui/button";
import { MAX_TOPIC_LENGTH } from "@/shared/ode";

type OdeTopicFieldsProps = {
  error?: string;
  isWriting?: boolean;
  onSubmit?: () => void;
  onTopicChange?: (topic: string) => void;
  phrases?: string[];
  topic: string;
};

const LINE_BREAKS = /\s*\n\s*/g;

const getButtonLabel = (isWriting: boolean, error: string | undefined) => {
  if (isWriting) {
    return "Writing…";
  }

  return error ? "Try again" : "Write my ode";
};

const fitHeight = (field: HTMLTextAreaElement | null) => {
  if (!field || CSS.supports("field-sizing", "content")) {
    return;
  }

  field.style.height = "auto";
  field.style.height = `${field.scrollHeight}px`;
};

const submitOnEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
  if (event.key !== "Enter" || event.shiftKey) {
    return;
  }

  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
};

const OdeTopicFields = ({
  error,
  isWriting = false,
  onSubmit,
  onTopicChange,
  phrases,
  topic,
}: OdeTopicFieldsProps) => {
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <form
      className="mt-10 flex w-full flex-col items-center"
      onSubmit={handleSubmit}
    >
      <div className="font-display flex w-full max-w-200 flex-wrap items-end justify-center gap-x-[0.4rem] text-[clamp(2.5rem,5vw,3.75rem)] leading-tight tracking-[-0.02em]">
        <label className="pb-[calc(0.25rem+3px)]" htmlFor="topic">
          Ode to
        </label>
        <textarea
          aria-describedby={error ? "topic-hint topic-error" : "topic-hint"}
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          className="border-input caret-destructive focus-visible:border-destructive w-full max-w-full resize-none overflow-hidden rounded-none border-0 border-b-[3px] bg-transparent pb-1 text-center text-balance outline-none supports-[field-sizing:content]:w-auto supports-[field-sizing:content]:min-w-[8ch] [field-sizing:content]"
          id="topic"
          maxLength={MAX_TOPIC_LENGTH}
          name="topic"
          onChange={(event) => {
            fitHeight(event.target);
            onTopicChange?.(event.target.value.replace(LINE_BREAKS, " "));
          }}
          onKeyDown={submitOnEnter}
          readOnly={isWriting}
          ref={fitHeight}
          required
          rows={1}
          value={topic}
        />
      </div>
      <p
        className="text-muted-foreground mt-5 max-w-[40ch] text-lg leading-normal text-balance"
        id="topic-hint"
      >
        Name anything, from pizza to Mondays. Claude writes the ode, then lays
        its picture in stone.
      </p>
      {error && (
        <p
          className="text-destructive mt-3 font-medium"
          id="topic-error"
          role="alert"
        >
          {error}
        </p>
      )}
      <Button className="mt-7" disabled={isWriting} type="submit">
        {getButtonLabel(isWriting, error)}
      </Button>
      {isWriting && (
        <div className="mt-4">
          <OdeProgressStatus hasTiles={false} phrases={phrases} />
        </div>
      )}
    </form>
  );
};

export default OdeTopicFields;
