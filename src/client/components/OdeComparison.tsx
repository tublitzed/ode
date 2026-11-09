import { cn } from "cn";
import type { ReactNode } from "react";

import MosaicPanel from "@/client/components/MosaicPanel";
import OdeProgressStatus from "@/client/components/OdeProgressStatus";
import OdeTitle from "@/client/components/OdeTitle";
import OdeVerse from "@/client/components/OdeVerse";
import { Button } from "@/client/components/ui/button";
import { ODE_TYPE_DETAILS } from "@/shared/ode";
import type { MosaicShape, OdeType } from "@/shared/ode";

const LOADER_INTERVAL_MS = 5000;

const LOADER_PHRASES = [
  "Pindaric odes are named for Pindar, a Greek poet of the 5th century BCE.",
  "Horatian odes are named for Horace, a Roman poet of the 1st century BCE.",
  "Sharpening the quill…",
  "Pindar wrote many of his odes to honor winners at games like the Olympics.",
  "Horace’s odes gave us “carpe diem,” often translated as “seize the day.”",
  "Admiring your subject…",
  "Pindaric odes were performed by a chorus, singing and dancing as they went.",
  "Where a Pindaric ode is a public celebration, a Horatian ode is a quiet, personal reflection.",
  "Polishing a stanza…",
];

export type OdeSlot =
  | { message: string; status: "failed" }
  | { status: "generating" }
  | { ode: string; status: "ode" };

export type OdeColumn = {
  slot: OdeSlot;
  type: OdeType;
};

type OdeComparisonProps = {
  actions?: ReactNode;
  columns: OdeColumn[];
  mosaic?: MosaicShape[];
  onRetry?: (type: OdeType) => void;
  topic: string;
};

const COLUMN_CLASS = "border-rule border-t-2 pt-5";

const OdeComparison = ({
  actions,
  columns,
  mosaic,
  onRetry,
  topic,
}: OdeComparisonProps) => {
  const pending = columns.filter(({ slot }) => slot.status === "generating");
  const pendingLabel = pending
    .map(({ type }) => ODE_TYPE_DETAILS[type].label)
    .join(" and ");

  return (
    <>
      {mosaic && (
        <MosaicPanel
          className="starting:max-w-100 max-w-70 transition-[max-width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          label={`A mosaic for the ode to ${topic}`}
          shapes={mosaic}
          state="laid"
        />
      )}
      <OdeTitle className="mt-10">Ode to {topic}</OdeTitle>
      <div className="mt-11 grid w-full max-w-136 gap-10 text-left min-[1101px]:max-w-310 min-[1101px]:grid-cols-3 min-[1101px]:gap-14">
        {columns.map(({ slot, type }) => {
          if (slot.status === "generating") {
            return type === pending[0].type ? (
              <section
                className={cn(
                  COLUMN_CLASS,
                  pending.length > 1 && "min-[1101px]:col-span-2",
                )}
                key={type}
              >
                <h2 className="font-display text-[1.625rem]">{pendingLabel}</h2>
                <div className="mt-6">
                  <OdeProgressStatus
                    align="start"
                    intervalMs={LOADER_INTERVAL_MS}
                    phrases={LOADER_PHRASES}
                  />
                </div>
              </section>
            ) : null;
          }

          return (
            <section className={COLUMN_CLASS} key={type}>
              <h2 className="font-display text-[1.625rem]">
                {ODE_TYPE_DETAILS[type].label}
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm leading-snug min-[1101px]:min-h-[2.9em]">
                {ODE_TYPE_DETAILS[type].description}
              </p>
              {slot.status === "failed" ? (
                <div className="mt-6 grid justify-items-start gap-4">
                  <p className="text-destructive font-medium" role="alert">
                    {slot.message}
                  </p>
                  {onRetry && (
                    <Button onClick={() => onRetry(type)} variant="outline">
                      Try again
                    </Button>
                  )}
                </div>
              ) : (
                <OdeVerse
                  className="animate-rise mt-6 text-lg motion-reduce:animate-none"
                  ode={slot.ode}
                />
              )}
            </section>
          );
        })}
      </div>
      {actions && <div className="mt-12">{actions}</div>}
    </>
  );
};

export default OdeComparison;
