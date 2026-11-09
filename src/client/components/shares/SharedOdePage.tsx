import { cn } from "cn";
import { useEffect, useState } from "react";

import OdeComparison from "@/client/components/OdeComparison";
import type { OdeColumn } from "@/client/components/OdeComparison";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { httpRequest } from "@/client/utils/httpRequest";
import {
  COMPARISON_TYPES,
  DEFAULT_ODE_TYPE,
  ODE_TYPE_DETAILS,
} from "@/shared/ode";
import type { SharedOde } from "@/shared/ode";

type View =
  | { message: string; status: "error" }
  | { sharedOde: SharedOde; status: "found" }
  | { status: "loading" }
  | { status: "notFound" };

type SharedOdePageProps = {
  forceView?: View; // Storybook only
  id: string;
};

const { description, label } = ODE_TYPE_DETAILS[DEFAULT_ODE_TYPE];

const toColumns = ({ comparison = {}, ode }: SharedOde): OdeColumn[] => [
  { slot: { ode, status: "ode" }, type: DEFAULT_ODE_TYPE },
  ...COMPARISON_TYPES.flatMap((type): OdeColumn[] => {
    const comparisonOde = comparison[type];
    return comparisonOde
      ? [{ slot: { ode: comparisonOde, status: "ode" }, type }]
      : [];
  }),
];

const hasComparison = (view: View) =>
  view.status === "found" &&
  Object.keys(view.sharedOde.comparison ?? {}).length > 0;

const renderView = (view: View) => {
  if (view.status === "loading") {
    return <p className="text-sm text-muted-foreground">Finding this ode…</p>;
  }

  if (view.status === "notFound") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>We couldn't find that ode</CardTitle>
          <CardDescription>
            The link may be incomplete, or the ode may have been removed.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (view.status === "error") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>We couldn't load that ode</CardTitle>
          <CardDescription>{view.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (hasComparison(view)) {
    return (
      <OdeComparison
        columns={toColumns(view.sharedOde)}
        topic={view.sharedOde.topic}
      />
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="wrap-anywhere">
          Ode to {view.sharedOde.topic}
        </CardTitle>
        <CardDescription>
          <span className="font-medium">{label}.</span> {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line">{view.sharedOde.ode}</p>
      </CardContent>
    </Card>
  );
};

const SharedOdePage = ({ forceView, id }: SharedOdePageProps) => {
  const [view, setView] = useState<View>(forceView ?? { status: "loading" });

  useEffect(() => {
    if (forceView) {
      return undefined;
    }

    let isCurrent = true;

    const load = async () => {
      const result = await httpRequest<SharedOde>(
        `/api/public/shares/${encodeURIComponent(id)}`,
      );
      if (!isCurrent) {
        return;
      }

      if (result.ok) {
        document.title = `Ode to ${result.data.topic} · ode`;
        setView({ sharedOde: result.data, status: "found" });
        return;
      }

      if (result.status === 404) {
        setView({ status: "notFound" });
        return;
      }

      setView({ message: result.message, status: "error" });
    };

    load();

    return () => {
      isCurrent = false;
    };
  }, [forceView, id]);

  return (
    <main
      className={cn(
        "mx-auto flex min-h-svh w-full flex-col items-center justify-center gap-4 p-4",
        hasComparison(view) ? "max-w-7xl" : "max-w-md",
      )}
    >
      {renderView(view)}
    </main>
  );
};

export default SharedOdePage;
