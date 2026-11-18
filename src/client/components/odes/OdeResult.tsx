import { Pencil } from "lucide-react";
import { useState } from "react";

import MosaicPanel from "@/client/components/mosaics/MosaicPanel";
import OdeActions from "@/client/components/odes/OdeActions";
import OdeProgressStatus from "@/client/components/odes/OdeProgressStatus";
import OdeRevisionForm from "@/client/components/odes/OdeRevisionForm";
import OdeTitle from "@/client/components/odes/OdeTitle";
import OdeTopicFields from "@/client/components/odes/OdeTopicFields";
import OdeVerse from "@/client/components/odes/OdeVerse";
import ShareOde from "@/client/components/shares/ShareOde";
import { Button } from "@/client/components/ui/button";
import type { MosaicShape } from "@/shared/ode";

const LAYING_PHRASES = ["Laying the tiles…"];
const REVISING_REASON = "Wait for the poet to finish this draft.";

type OdeResultProps = {
  changeRequest: string;
  isFresh: boolean;
  isRevising: boolean;
  mosaic?: MosaicShape[];
  ode: string;
  onChangeRequestChange: (changeRequest: string) => void;
  onCompare: () => void;
  onRevise: () => void;
  onWriteAnother: () => void;
  revisionError?: string;
  topic: string;
};

const OdeResult = ({
  changeRequest,
  isFresh,
  isRevising,
  mosaic,
  ode,
  onChangeRequestChange,
  onCompare,
  onRevise,
  onWriteAnother,
  revisionError,
  topic,
}: OdeResultProps) => {
  const [isLaid, setIsLaid] = useState(!isFresh);

  return (
    <>
      <MosaicPanel
        className="max-w-[min(25rem,72vw)]"
        label={`A mosaic for the ode to ${topic}`}
        onLaid={() => setIsLaid(true)}
        shapes={mosaic}
        state={isLaid ? "laid" : "laying"}
      />
      {isLaid ? (
        <>
          <OdeTitle className="mt-10">Ode to {topic}</OdeTitle>
          <OdeVerse
            className="animate-rise mt-9 max-w-136 text-left motion-reduce:animate-none"
            key={ode}
            ode={ode}
          />
          <OdeRevisionForm
            changeRequest={changeRequest}
            error={revisionError}
            isRevising={isRevising}
            onChangeRequestChange={onChangeRequestChange}
            onSubmit={onRevise}
          />
          <OdeActions>
            <Button
              className="col-span-2"
              disabled={isRevising}
              disabledReason={REVISING_REASON}
              onClick={onCompare}
              size="compact"
              variant="outline"
            >
              Compare odes
            </Button>
            <ShareOde
              disabled={isRevising}
              disabledReason={REVISING_REASON}
              key={ode}
              mosaic={mosaic}
              ode={ode}
              size="compact"
              topic={topic}
            />
            <Button
              disabled={isRevising}
              disabledReason={REVISING_REASON}
              onClick={onWriteAnother}
              size="compact"
            >
              <Pencil />
              Write another ode
            </Button>
          </OdeActions>
        </>
      ) : (
        <OdeTopicFields
          isWriting
          status={
            <OdeProgressStatus
              hasTiles={false}
              label="Laying the tiles."
              phrases={LAYING_PHRASES}
            />
          }
          topic={topic}
        />
      )}
    </>
  );
};

export default OdeResult;
