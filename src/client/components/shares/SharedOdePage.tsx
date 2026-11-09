import { useEffect, useState } from "react";

import OdeComparison from "@/client/components/OdeComparison";
import type { OdeColumn } from "@/client/components/OdeComparison";
import OdeTitle from "@/client/components/OdeTitle";
import OdeVerse from "@/client/components/OdeVerse";
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

const renderMessage = (title: string, message: string) => (
  <>
    <OdeTitle>{title}</OdeTitle>
    <p className="text-muted-foreground mt-3 max-w-[44ch] text-lg leading-normal text-balance">
      {message}
    </p>
  </>
);

const renderView = (view: View) => {
  if (view.status === "loading") {
    return <p className="text-muted-foreground">Finding this ode…</p>;
  }

  if (view.status === "notFound") {
    return renderMessage(
      "We couldn’t find that ode",
      "The link may be incomplete, or the ode may have been removed.",
    );
  }

  if (view.status === "error") {
    return renderMessage("We couldn’t load that ode", view.message);
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
    <>
      <OdeTitle>Ode to {view.sharedOde.topic}</OdeTitle>
      <p className="text-muted-foreground mt-3 max-w-[44ch] leading-normal text-balance">
        <span className="text-foreground font-semibold">{label}.</span>{" "}
        {description}
      </p>
      <OdeVerse className="mt-9 max-w-136 text-left" ode={view.sharedOde.ode} />
    </>
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
    <main className="flex min-h-svh w-full flex-col items-center justify-center px-4 py-16 text-center">
      {renderView(view)}
    </main>
  );
};

export default SharedOdePage;
