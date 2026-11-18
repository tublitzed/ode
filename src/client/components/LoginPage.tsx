import { useState } from "react";
import type { SubmitEvent } from "react";

import MosaicPanel from "@/client/components/mosaics/MosaicPanel";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { NIGHTINGALE } from "@/client/utils/nightingale";

const FALLBACK_PATH = "/";
const PARSE_BASE = "http://same-origin.invalid";

// Only allow next path if same domain.
export const safeNextPath = (next: string | null) => {
  if (!next?.startsWith("/")) {
    return FALLBACK_PATH;
  }

  const url = new URL(next, PARSE_BASE);
  if (url.origin !== PARSE_BASE || url.pathname === "/login") {
    return FALLBACK_PATH;
  }

  return `${url.pathname}${url.search}${url.hash}`;
};

const LoginPage = () => {
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        body: JSON.stringify({ password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (res.ok) {
        const next = new URLSearchParams(window.location.search).get("next");
        window.location.assign(safeNextPath(next));
        return;
      }

      setError(
        res.status === 401
          ? "Close, but no laurel wreath. That’s not the password."
          : "The muse lost the thread. Try again.",
      );
    } catch {
      setError("The muse lost the thread. Try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 py-16">
      <MosaicPanel
        className="max-w-72"
        label="A mosaic of a nightingale singing on a branch"
        shapes={NIGHTINGALE}
        state="laying"
      />
      <h1 className="font-display mt-8 text-[clamp(3.5rem,8vw,4.5rem)] leading-none tracking-[-0.02em]">
        Ode
      </h1>
      <form className="mt-8 grid w-full max-w-sm gap-6" onSubmit={handleSubmit}>
        <div className="grid gap-1">
          <Label
            className="text-muted-foreground justify-center text-center"
            htmlFor="password"
          >
            Enter the password to continue:
          </Label>
          <Input
            aria-describedby={error ? "password-error" : undefined}
            aria-invalid={error ? true : undefined}
            autoComplete="current-password"
            autoFocus
            className="text-center"
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          {error && (
            <p
              className="text-destructive mt-2 text-center font-medium"
              id="password-error"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
        <Button
          className="w-full"
          disabled={isSubmitting}
          disabledReason="Checking the password."
          type="submit"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </main>
  );
};

export default LoginPage;
