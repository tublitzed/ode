import { useState } from "react";

import OdeDeclined from "@/client/app/OdeDeclined";
import OdeForm from "@/client/app/OdeForm";
import OdeProgress from "@/client/app/OdeProgress";
import OdeResult from "@/client/app/OdeResult";
import { requestOde } from "@/client/app/requestOde";
import { Button } from "@/components/ui/button";

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

const App = () => {
  const [topic, setTopic] = useState("");
  const [view, setView] = useState<View>({ status: "idle" });

  const generate = async (nextTopic: string) => {
    setView({ status: "generating", topic: nextTopic });

    const result = await requestOde(nextTopic);

    if (result.status === "unauthorized") {
      window.location.assign("/login?next=%2F");
      return;
    }

    if (result.status === "error") {
      setView({ message: result.message, status: "error" });
      return;
    }

    if (result.status === "declined") {
      setView({
        reason: result.reason,
        status: "declined",
        suggestions: result.suggestions,
      });
      return;
    }

    setView({ ode: result.ode, status: "ode", topic: nextTopic });
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
