import { useState } from "react";
import type { SubmitEvent } from "react";

import { Button } from "@/client/components/ui/button";
import { Card, CardContent } from "@/client/components/ui/card";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";

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
          ? "Incorrect password."
          : "Something went wrong. Try again.",
      );
    } catch {
      setError("Something went wrong. Try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="password">Enter the password to continue:</Label>
              <Input
                aria-describedby={error ? "password-error" : undefined}
                aria-invalid={error ? true : undefined}
                autoComplete="current-password"
                autoFocus
                id="password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              {error && (
                <p
                  className="text-destructive text-sm"
                  id="password-error"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Logging in…" : "Log in to Ode"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default LoginPage;
