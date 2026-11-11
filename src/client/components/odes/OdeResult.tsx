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
import { DEFAULT_ODE_TYPE, ODE_TYPE_DETAILS } from "@/shared/ode";
import type { MosaicShape } from "@/shared/ode";

const LAYING_PHRASES = ["Laying the tiles…"];

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
  topic: string;
};

const { description, label } = ODE_TYPE_DETAILS[DEFAULT_ODE_TYPE];

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
          <p className="text-muted-foreground mt-3 max-w-[44ch] leading-normal text-balance">
            <span className="text-foreground font-semibold">{label}.</span>{" "}
            {description}
          </p>
          <OdeVerse
            className="animate-rise mt-9 max-w-136 text-left motion-reduce:animate-none"
            key={ode}
            ode={ode}
          />
          <OdeRevisionForm
            changeRequest={changeRequest}
            isRevising={isRevising}
            onChangeRequestChange={onChangeRequestChange}
            onSubmit={onRevise}
          />
          <OdeActions>
            <Button
              className="col-span-2"
              disabled={isRevising}
              onClick={onCompare}
              size="compact"
              variant="outline"
            >
              Compare Pindaric and Horatian odes
            </Button>
            <ShareOde
              disabled={isRevising}
              key={ode}
              mosaic={mosaic}
              ode={ode}
              size="compact"
              topic={topic}
            />
            <Button
              disabled={isRevising}
              onClick={onWriteAnother}
              size="compact"
            >
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
