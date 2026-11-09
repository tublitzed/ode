import { useState } from "react";

import MosaicPanel from "@/client/components/MosaicPanel";
import OdeTitle from "@/client/components/OdeTitle";
import OdeTopicFields from "@/client/components/OdeTopicFields";
import OdeVerse from "@/client/components/OdeVerse";
import ShareOde from "@/client/components/shares/ShareOde";
import { Button } from "@/client/components/ui/button";
import { DEFAULT_ODE_TYPE, ODE_TYPE_DETAILS } from "@/shared/ode";
import type { MosaicShape } from "@/shared/ode";

const LAYING_PHRASES = ["Laying the tiles…"];

type OdeResultProps = {
  isFresh: boolean;
  mosaic?: MosaicShape[];
  ode: string;
  onCompare: () => void;
  onWriteAnother: () => void;
  topic: string;
};

const { description, label } = ODE_TYPE_DETAILS[DEFAULT_ODE_TYPE];

const OdeResult = ({
  isFresh,
  mosaic,
  ode,
  onCompare,
  onWriteAnother,
  topic,
}: OdeResultProps) => {
  const [isLaid, setIsLaid] = useState(!isFresh);

  return (
    <>
      <MosaicPanel
        className="max-w-100"
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
          <div className="animate-rise flex flex-col items-center motion-reduce:animate-none">
            <OdeVerse className="mt-9 max-w-136 text-left" ode={ode} />
            <div className="mt-11 flex flex-wrap justify-center gap-3">
              <Button onClick={onCompare} variant="outline">
                Compare Pindaric and Horatian odes
              </Button>
              <ShareOde mosaic={mosaic} ode={ode} topic={topic} />
              <Button onClick={onWriteAnother}>Write another ode</Button>
            </div>
          </div>
        </>
      ) : (
        <OdeTopicFields isWriting phrases={LAYING_PHRASES} topic={topic} />
      )}
    </>
  );
};

export default OdeResult;
