import express from "express";
import type { Router } from "express";

import {
  createSessionToken,
  getAuthConfig,
  safeEqual,
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
} from "#/server/auth.ts";
import { createLoginLimiter } from "#/server/loginLimiter.ts";

const getCookieOptions = () =>
  ({
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  }) as const;

export const createAuthRouter = (): Router => {
  const authRouter = express.Router();
  const loginLimiter = createLoginLimiter();

  authRouter.post("/api/login", express.json(), (req, res) => {
    const { expectedPassword, key } = getAuthConfig();
    const client = req.ip ?? "unknown";

    const retryAfterSeconds = loginLimiter.getRetryAfterSeconds(client);
    if (retryAfterSeconds !== undefined) {
      res.set("Retry-After", String(retryAfterSeconds));
      res.sendStatus(429);
      return;
    }

    const provided: unknown = req.body?.password;

    if (
      typeof provided !== "string" ||
      !safeEqual(provided.trim(), expectedPassword)
    ) {
      loginLimiter.recordFailure(client);
      res.sendStatus(401);
      return;
    }

    loginLimiter.clearFailures(client);
    res.cookie(SESSION_COOKIE, createSessionToken(key), {
      ...getCookieOptions(),
      maxAge: SESSION_MAX_AGE_MS,
    });
    res.sendStatus(204);
  });

  authRouter.post("/api/logout", (_req, res) => {
    res.clearCookie(SESSION_COOKIE, getCookieOptions());
    res.sendStatus(204);
  });

  return authRouter;
};
