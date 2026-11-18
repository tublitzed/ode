import { useCallback, useEffect, useRef, useState } from "react";
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
const MISSING_TOPIC = "Even the muse needs a subject. Name one above.";

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
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);
  const [isMissingTopic, setIsMissingTopic] = useState(false);
  const message = error ?? (isMissingTopic ? MISSING_TOPIC : undefined);
  const describedBy =
    [isWriting ? undefined : "topic-hint", message ? "topic-error" : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  const setField = useCallback((field: HTMLTextAreaElement | null) => {
    fieldRef.current = field;
    fitHeight(field);
  }, []);

  useEffect(() => {
    if (isWriting) {
      return;
    }

    fieldRef.current?.focus({ preventScroll: true });
  }, [isWriting]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!topic.trim()) {
      setIsMissingTopic(true);
      fieldRef.current?.focus();
      return;
    }

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
          aria-describedby={describedBy}
          aria-invalid={message ? true : undefined}
          aria-required
          autoComplete="off"
          className="border-input caret-destructive focus-visible:border-destructive aria-invalid:border-destructive placeholder:text-muted-foreground w-full max-w-full resize-none overflow-hidden rounded-none border-0 border-b-[3px] bg-transparent pb-1 text-center text-balance outline-none supports-[field-sizing:content]:w-auto supports-[field-sizing:content]:min-w-[8ch] [field-sizing:content]"
          id="topic"
          maxLength={MAX_TOPIC_LENGTH}
          name="topic"
          onChange={(event) => {
            fitHeight(event.target);
            setIsMissingTopic(false);
            onTopicChange?.(event.target.value.replace(LINE_BREAKS, " "));
          }}
          onKeyDown={submitOnEnter}
          placeholder={placeholder}
          readOnly={isWriting}
          ref={setField}
          rows={1}
          value={topic}
        />
      </div>
      <p className="font-display text-muted-foreground mt-3 text-[clamp(1.375rem,2.5vw,1.875rem)] leading-tight tracking-[-0.01em]">
        …with Anthropic
      </p>
      <div className="mt-6 flex min-h-[3em] max-w-[40ch] flex-col items-center text-lg leading-normal">
        {isWriting && status ? (
          status
        ) : (
          <p className="text-muted-foreground text-balance" id="topic-hint">
            Name anything, from pizza to Mondays.
          </p>
        )}
      </div>
      {message && (
        <p
          className="text-destructive font-medium"
          id="topic-error"
          role="alert"
        >
          {message}
        </p>
      )}
      <Button
        className="mt-4"
        disabled={isWriting}
        disabledReason="The poet is still writing your ode."
        type="submit"
      >
        {getButtonLabel(isWriting, error)}
      </Button>
    </form>
  );
};

export default OdeTopicFields;
