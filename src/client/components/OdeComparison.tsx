import { cn } from "cn";
import type { ReactNode } from "react";

import OdeProgressStatus from "@/client/components/OdeProgressStatus";
import OdeVerse from "@/client/components/OdeVerse";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { ODE_TYPE_DETAILS } from "@/shared/ode";
import type { OdeType } from "@/shared/ode";

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
  onRetry?: (type: OdeType) => void;
  topic: string;
};

const OdeComparison = ({
  actions,
  columns,
  onRetry,
  topic,
}: OdeComparisonProps) => {
  const pending = columns.filter(({ slot }) => slot.status === "generating");
  const pendingLabel = pending
    .map(({ type }) => ODE_TYPE_DETAILS[type].label)
    .join(" and ");

  return (
    <>
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        <h1 className="min-w-0 text-lg font-semibold wrap-anywhere">
          Ode to {topic}
        </h1>
        {actions}
      </div>
      <div className="grid w-full gap-4 xl:grid-cols-3">
        {columns.map(({ slot, type }) => {
          if (slot.status === "generating") {
            return type === pending[0].type ? (
              <Card
                className={cn(pending.length > 1 && "xl:col-span-2")}
                key={type}
              >
                <CardHeader>
                  <CardTitle>{pendingLabel}</CardTitle>
                </CardHeader>
                <CardContent>
                  <OdeProgressStatus
                    intervalMs={LOADER_INTERVAL_MS}
                    phrases={LOADER_PHRASES}
                  />
                </CardContent>
              </Card>
            ) : null;
          }

          return (
            <Card key={type}>
              <CardHeader>
                <CardTitle>{ODE_TYPE_DETAILS[type].label}</CardTitle>
                <CardDescription>
                  {ODE_TYPE_DETAILS[type].description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {slot.status === "failed" ? (
                  <div className="grid justify-items-start gap-4">
                    <p className="text-destructive text-sm" role="alert">
                      {slot.message}
                    </p>
                    {onRetry && (
                      <Button onClick={() => onRetry(type)} variant="outline">
                        Try again
                      </Button>
                    )}
                  </div>
                ) : (
                  <OdeVerse ode={slot.ode} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default OdeComparison;
