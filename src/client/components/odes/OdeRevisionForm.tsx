import type { SubmitEvent } from "react";

import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { MAX_CHANGE_REQUEST_LENGTH } from "@/shared/ode";

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
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      className="mt-10 grid w-full max-w-136 gap-2 text-left"
      onSubmit={handleSubmit}
    >
      <Label htmlFor="change-request">Want to change anything?</Label>
      <div className="flex items-end gap-3">
        <Input
          aria-describedby={error ? "change-request-error" : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          id="change-request"
          maxLength={MAX_CHANGE_REQUEST_LENGTH}
          name="changeRequest"
          onChange={(event) => onChangeRequestChange(event.target.value)}
          placeholder="Make it rhyme more"
          readOnly={isRevising}
          value={changeRequest}
        />
        <Button
          disabled={isRevising || !changeRequest.trim()}
          size="compact"
          type="submit"
          variant="outline"
        >
          {isRevising ? "Revising…" : "Revise"}
        </Button>
      </div>
      {error && (
        <p
          className="text-destructive font-medium"
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
