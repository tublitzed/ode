import { useState } from "react";

import OdeForm from "@/client/app/OdeForm";
import OdeProgress from "@/client/app/OdeProgress";
import OdeResult from "@/client/app/OdeResult";
import { requestOde } from "@/client/app/requestOde";
import { Button } from "@/components/ui/button";

type View =
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

  const handleSubmit = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      return;
    }

    setView({ status: "generating", topic: trimmedTopic });

    const result = await requestOde(trimmedTopic);

    if (result.status === "unauthorized") {
      window.location.assign("/login?next=%2F");
      return;
    }

    if (result.status === "error") {
      setView({ message: result.message, status: "error" });
      return;
    }

    setView({ ode: result.ode, status: "ode", topic: trimmedTopic });
  };

  const handleTopicChange = (nextTopic: string) => {
    setTopic(nextTopic);
    setView({ status: "idle" });
  };

  const handleWriteAnother = () => {
    setTopic("");
    setView({ status: "idle" });
  };

  const renderView = () => {
    if (view.status === "generating") {
      return <OdeProgress topic={view.topic} />;
    }

    if (view.status === "ode") {
      return (
        <OdeResult
          ode={view.ode}
          onWriteAnother={handleWriteAnother}
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
