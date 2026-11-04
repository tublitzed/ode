import { useState } from "react";

import OdeDeclined from "@/client/app/OdeDeclined";
import OdeForm from "@/client/app/OdeForm";
import OdeProgress from "@/client/app/OdeProgress";
import OdeResult from "@/client/app/OdeResult";
import { Button } from "@/client/components/ui/button";
import { httpRequest } from "@/client/utils/httpRequest";
import { loadLastOde, saveLastOde } from "@/client/utils/localStorage";
import type { OdeResponse } from "@/shared/ode";

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
  return lastOde ? { ...lastOde, status: "ode" } : { status: "idle" };
};

const App = () => {
  const [topic, setTopic] = useState("");
  const [view, setView] = useState<View>(getInitialView);

  const generate = async (nextTopic: string) => {
    setView({ status: "generating", topic: nextTopic });

    const result = await httpRequest<OdeResponse>("/api/odes", {
      body: { topic: nextTopic },
      method: "POST",
    });

    if (!result.ok && result.status === 401) {
      window.location.assign("/login?next=%2F");
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

  const startOver = () => {
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
      return (
        <OdeResult
          ode={view.ode}
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
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center gap-4 p-4">
      {renderView()}
      <Button onClick={logOut} variant="ghost">
        Log out
      </Button>
    </main>
  );
};

export default App;
