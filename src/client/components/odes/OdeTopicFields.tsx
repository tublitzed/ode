import type { KeyboardEvent, ReactNode, SubmitEvent } from "react";

import { Button } from "@/client/components/ui/button";
import { MAX_TOPIC_LENGTH } from "@/shared/ode";

type OdeTopicFieldsProps = {
  error?: string;
  isWriting?: boolean;
  onSubmit?: () => void;
  onTopicChange?: (topic: string) => void;
  placeholder?: string;
  status?: ReactNode;
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
  placeholder,
  status,
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
          className="border-input caret-destructive focus-visible:border-destructive placeholder:text-muted-foreground w-full max-w-full resize-none overflow-hidden rounded-none border-0 border-b-[3px] bg-transparent pb-1 text-center text-balance outline-none supports-[field-sizing:content]:w-auto supports-[field-sizing:content]:min-w-[8ch] [field-sizing:content]"
          id="topic"
          maxLength={MAX_TOPIC_LENGTH}
          name="topic"
          onChange={(event) => {
            fitHeight(event.target);
            onTopicChange?.(event.target.value.replace(LINE_BREAKS, " "));
          }}
          onKeyDown={submitOnEnter}
          placeholder={placeholder}
          readOnly={isWriting}
          ref={fitHeight}
          required
          rows={1}
          value={topic}
        />
      </div>
      <p className="font-display text-muted-foreground mt-3 text-[clamp(1.375rem,2.5vw,1.875rem)] leading-tight tracking-[-0.01em]">
        …with Anthropic
      </p>
      <p
        className="text-muted-foreground mt-6 max-w-[40ch] text-lg leading-normal text-balance"
        id="topic-hint"
      >
        Name anything, from pizza to Mondays.
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
      {isWriting && status && <div className="mt-4">{status}</div>}
    </form>
  );
};

export default OdeTopicFields;
