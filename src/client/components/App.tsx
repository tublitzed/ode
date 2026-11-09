import { cn } from "cn";
import { useState } from "react";

import OdeComparison from "@/client/components/OdeComparison";
import type { OdeColumn, OdeSlot } from "@/client/components/OdeComparison";
import OdeDeclined from "@/client/components/OdeDeclined";
import OdeForm from "@/client/components/OdeForm";
import OdeProgress from "@/client/components/OdeProgress";
import OdeResult from "@/client/components/OdeResult";
import ShareOde from "@/client/components/shares/ShareOde";
import { Button } from "@/client/components/ui/button";
import { httpRequest } from "@/client/utils/httpRequest";
import type { HttpResult } from "@/client/utils/httpRequest";
import {
  clearLastOde,
  loadLastOde,
  saveComparisonOde,
  saveLastOde,
} from "@/client/utils/localStorage";
import type { SavedComparison } from "@/client/utils/localStorage";
import { COMPARISON_TYPES, DEFAULT_ODE_TYPE } from "@/shared/ode";
import type { Comparison, OdeResponse, OdeType } from "@/shared/ode";

const UNSAVED_ODE_MESSAGE = "This ode didn't finish. Try writing it again.";

type OdeRequest = {
  sourceOde?: string;
  topic: string;
  type: OdeType;
};

type View =
  | { reason: string; status: "declined"; suggestions: string[] }
  | { message: string; status: "error" }
  | { status: "generating"; topic: string }
  | { status: "idle" }
  | { ode: string; status: "ode"; topic: string };

const logOut = async () => {
  try {
    await fetch("/api/logout", { method: "POST" });
  } finally {
    window.location.assign("/login");
  }
};

const getInitialView = (): View => {
  const lastOde = loadLastOde();

  if (!lastOde) {
    return { status: "idle" };
  }

  return { ode: lastOde.ode, status: "ode", topic: lastOde.topic };
};

export const toComparisonColumns = (
  comparison: SavedComparison,
): OdeColumn[] => {
  if (Object.keys(comparison).length === 0) {
    return [];
  }

  return COMPARISON_TYPES.map((type) => {
    const ode = comparison[type];

    return {
      slot: ode
        ? { ode, status: "ode" }
        : { message: UNSAVED_ODE_MESSAGE, status: "failed" },
      type,
    };
  });
};

const toSharedComparison = (columns: OdeColumn[]): Comparison =>
  Object.fromEntries(
    columns.flatMap(({ slot, type }) =>
      slot.status === "ode" ? [[type, slot.ode]] : [],
    ),
  );

const getInitialColumns = () =>
  toComparisonColumns(loadLastOde()?.comparison ?? {});

const requestOde = async (body: OdeRequest) => {
  const result = await httpRequest<OdeResponse>("/api/odes", {
    body,
    method: "POST",
  });

  if (!result.ok && result.status === 401) {
    window.location.assign("/login?next=%2F");
    return undefined;
  }

  return result;
};

const toOdeSlot = (result: HttpResult<OdeResponse>): OdeSlot => {
  if (!result.ok) {
    return { message: result.message, status: "failed" };
  }

  if (result.data.status === "declined") {
    return { message: result.data.reason, status: "failed" };
  }

  return { ode: result.data.ode, status: "ode" };
};

const writeComparisonColumn = async (
  sourceOde: string,
  sourceTopic: string,
  type: OdeType,
) => {
  const result = await requestOde({ sourceOde, topic: sourceTopic, type });

  if (!result) {
    return undefined;
  }

  const slot = toOdeSlot(result);

  if (slot.status === "ode") {
    saveComparisonOde(type, slot.ode);
  }

  return { slot, type };
};

const App = () => {
  const [columns, setColumns] = useState<OdeColumn[]>(getInitialColumns);
  const [topic, setTopic] = useState("");
  const [view, setView] = useState<View>(getInitialView);

  const isComparing = columns.length > 0;

  const generate = async (nextTopic: string) => {
    setView({ status: "generating", topic: nextTopic });

    const result = await requestOde({
      topic: nextTopic,
      type: DEFAULT_ODE_TYPE,
    });

    if (!result) {
      return;
    }

    if (!result.ok) {
      setView({ message: result.message, status: "error" });
      return;
    }

    if (result.data.status === "declined") {
      setView({
        reason: result.data.reason,
        status: "declined",
        suggestions: result.data.suggestions,
      });
      return;
    }

    const lastOde = { ode: result.data.ode, topic: nextTopic };
    saveLastOde(lastOde);
    setView({ ...lastOde, status: "ode" });
  };

  const handleSubmit = () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      return;
    }

    generate(trimmedTopic);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setTopic(suggestion);
    generate(suggestion);
  };

  const handleTopicChange = (nextTopic: string) => {
    setTopic(nextTopic);
    setView({ status: "idle" });
  };

  const handleCompare = async (sourceOde: string, sourceTopic: string) => {
    setColumns(
      COMPARISON_TYPES.map((type) => ({
        slot: { status: "generating" },
        type,
      })),
    );

    const written = await Promise.all(
      COMPARISON_TYPES.map((type) =>
        writeComparisonColumn(sourceOde, sourceTopic, type),
      ),
    );

    setColumns(written.filter((column) => column !== undefined));
  };

  const handleRetry = async (
    sourceOde: string,
    sourceTopic: string,
    type: OdeType,
  ) => {
    const replaceColumn = (next: OdeColumn) => {
      setColumns((current) =>
        current.map((column) => (column.type === type ? next : column)),
      );
    };

    replaceColumn({ slot: { status: "generating" }, type });

    const written = await writeComparisonColumn(sourceOde, sourceTopic, type);

    if (written) {
      replaceColumn(written);
    }
  };

  const startOver = () => {
    clearLastOde();
    setColumns([]);
    setTopic("");
    setView({ status: "idle" });
  };

  const renderView = () => {
    if (view.status === "generating") {
      return <OdeProgress topic={view.topic} />;
    }

    if (view.status === "declined") {
      return (
        <OdeDeclined
          onEnterDifferentTopic={startOver}
          onSelectSuggestion={handleSelectSuggestion}
          reason={view.reason}
          suggestions={view.suggestions}
        />
      );
    }

    if (view.status === "ode") {
      if (isComparing) {
        const isWriting = columns.some(
          ({ slot }) => slot.status === "generating",
        );
        const sharedComparison = toSharedComparison(columns);

        return (
          <OdeComparison
            actions={
              <div className="flex shrink-0 items-start gap-2">
                {!isWriting && (
                  <div className="w-56">
                    <ShareOde
                      comparison={sharedComparison}
                      key={JSON.stringify(sharedComparison)}
                      ode={view.ode}
                      topic={view.topic}
                    />
                  </div>
                )}
                <Button disabled={isWriting} onClick={startOver}>
                  Write another ode
                </Button>
              </div>
            }
            columns={[
              {
                slot: { ode: view.ode, status: "ode" },
                type: DEFAULT_ODE_TYPE,
              },
              ...columns,
            ]}
            onRetry={(type) => handleRetry(view.ode, view.topic, type)}
            topic={view.topic}
          />
        );
      }

      return (
        <OdeResult
          ode={view.ode}
          onCompare={() => handleCompare(view.ode, view.topic)}
          onWriteAnother={startOver}
          topic={view.topic}
        />
      );
    }

    return (
      <OdeForm
        error={view.status === "error" ? view.message : undefined}
        onSubmit={handleSubmit}
        onTopicChange={handleTopicChange}
        topic={topic}
      />
    );
  };

  return (
    <div className="relative">
      <main
        className={cn(
          "mx-auto flex min-h-svh w-full flex-col items-center justify-center gap-4 p-4 pb-16",
          isComparing ? "max-w-7xl" : "max-w-md",
        )}
      >
        {renderView()}
      </main>
      <Button
        className="absolute right-4 bottom-4"
        onClick={logOut}
        variant="ghost"
      >
        Log out
      </Button>
    </div>
  );
};

export default App;
