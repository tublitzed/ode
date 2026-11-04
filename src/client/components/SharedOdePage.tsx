import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { httpRequest } from "@/client/utils/httpRequest";
import type { SharedOde } from "@/shared/ode";

type SharedOdePageProps = {
  id: string;
};

type View =
  | { message: string; status: "error" }
  | { sharedOde: SharedOde; status: "found" }
  | { status: "loading" }
  | { status: "notFound" };

const NOT_FOUND_STATUS = 404;

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="wrap-anywhere">
          Ode to {view.sharedOde.topic}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line">{view.sharedOde.ode}</p>
      </CardContent>
    </Card>
  );
};

const SharedOdePage = ({ id }: SharedOdePageProps) => {
  const [view, setView] = useState<View>({ status: "loading" });

  useEffect(() => {
    let isCurrent = true;

    const load = async () => {
      const result = await httpRequest<SharedOde>(
        `/api/shares/${encodeURIComponent(id)}`,
      );
      if (!isCurrent) {
        return;
      }

      if (result.ok) {
        document.title = `Ode to ${result.data.topic} · ode`;
        setView({ sharedOde: result.data, status: "found" });
        return;
      }

      if (result.status === NOT_FOUND_STATUS) {
        setView({ status: "notFound" });
        return;
      }

      setView({ message: result.message, status: "error" });
    };

    load();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center gap-4 p-4">
      {renderView(view)}
    </main>
  );
};

export default SharedOdePage;
