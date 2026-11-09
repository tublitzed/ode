import express from "express";
import type { Router } from "express";

import {
  createSessionToken,
  getAuthConfig,
  safeEqual,
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
} from "#/server/auth.ts";

const getCookieOptions = () =>
  ({
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  }) as const;

export const authRouter: Router = express.Router();

authRouter.post("/api/login", express.json(), (req, res) => {
  const { expectedPassword, key } = getAuthConfig();
  const provided: unknown = req.body?.password;

  if (
    typeof provided !== "string" ||
    !safeEqual(provided.trim(), expectedPassword)
  ) {
    res.sendStatus(401);
    return;
  }

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
