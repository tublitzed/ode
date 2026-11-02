import express from "express";
import type { Router } from "express";

import {
  createSessionToken,
  safeEqual,
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
} from "#/server/auth.ts";

type AuthRouterOptions = {
  expectedPassword: string;
  key: Buffer;
  secureCookies: boolean;
};

export const createAuthRouter = ({
  expectedPassword,
  key,
  secureCookies,
}: AuthRouterOptions) => {
  const cookieOptions = {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: secureCookies,
  } as const;

  const router: Router = express.Router();

  router.post("/api/login", express.json(), (req, res) => {
    const provided: unknown = req.body?.password;
    if (
      typeof provided !== "string" ||
      !safeEqual(provided.trim(), expectedPassword)
    ) {
      res.sendStatus(401);
      return;
    }

    res.cookie(SESSION_COOKIE, createSessionToken(key), {
      ...cookieOptions,
      maxAge: SESSION_MAX_AGE_MS,
    });
    res.sendStatus(204);
  });

  router.post("/api/logout", (_req, res) => {
    res.clearCookie(SESSION_COOKIE, cookieOptions);
    res.sendStatus(204);
  });

  return router;
};
