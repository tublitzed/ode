import { parseCookie } from "cookie";
import express from "express";
import type { Request, RequestHandler, Router } from "express";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { extname, posix } from "node:path";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const PUBLIC_PATHS = new Set(["/api/login", "/login"]);

const DEV_PUBLIC_PREFIXES = [
  "/@id/",
  "/@react-refresh",
  "/@vite/",
  "/node_modules/",
  "/src/client/login/",
  "/src/components/",
  "/src/index.css",
  "/src/lib/",
];

type AuthOptions = {
  isPublicPath: (path: string) => boolean;
  password: string | undefined;
  secureCookies: boolean;
};

export type IsPublicPath = AuthOptions["isPublicPath"];

const sign = (key: Buffer, value: string) =>
  createHmac("sha256", key).update(value).digest("base64url");

export const deriveSessionKey = (password: string) =>
  createHash("sha256").update(`session:${password}`).digest();

export const createSessionToken = (key: Buffer, now = Date.now()) => {
  const issuedAt = String(now);
  return `${issuedAt}.${sign(key, issuedAt)}`;
};

export const isValidSessionToken = (
  key: Buffer,
  token: string,
  now = Date.now(),
) => {
  const [issuedAt, signature, ...rest] = token.split(".");
  if (!issuedAt || !signature || rest.length > 0) {
    return false;
  }

  const expected = Buffer.from(sign(key, issuedAt));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return false;
  }

  const issuedAtMs = Number(issuedAt);
  if (!Number.isSafeInteger(issuedAtMs) || issuedAtMs > now) {
    return false;
  }

  return now - issuedAtMs < SESSION_MAX_AGE_MS;
};

export const normalizePath = (path: string) => {
  try {
    return posix.normalize(decodeURIComponent(path)).toLowerCase();
  } catch {
    return undefined;
  }
};

export const isDevPublicPath: IsPublicPath = (path) =>
  DEV_PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));

const isPageRequest = (req: Request, path: string) => {
  if (req.method !== "GET" || path.startsWith("/api/")) {
    return false;
  }

  return (
    req.headers.accept?.includes("text/html") === true || extname(path) === ""
  );
};

export const createAuth = ({
  isPublicPath,
  password,
  secureCookies,
}: AuthOptions) => {
  const expectedPassword = password?.trim();
  if (!expectedPassword) {
    throw new Error("APP_PASSWORD must be set to a non-blank value.");
  }

  const key = deriveSessionKey(expectedPassword);

  const hasValidSession = (req: Request) => {
    const token = parseCookie(req.headers.cookie ?? "")[SESSION_COOKIE];
    return token !== undefined && isValidSessionToken(key, token);
  };

  const gate: RequestHandler = (req, res, next) => {
    const path = normalizePath(req.path);
    if (path === undefined) {
      res.sendStatus(400);
      return;
    }

    if (PUBLIC_PATHS.has(path) || isPublicPath(path) || hasValidSession(req)) {
      next();
      return;
    }

    if (isPageRequest(req, path)) {
      res.redirect(302, `/login?next=${encodeURIComponent(req.originalUrl)}`);
      return;
    }

    res.sendStatus(401);
  };

  const router: Router = express.Router();

  router.post("/api/login", express.json(), (req, res) => {
    const provided: unknown = req.body?.password;
    if (typeof provided !== "string" || provided.trim() !== expectedPassword) {
      res.sendStatus(401);
      return;
    }

    res.cookie(SESSION_COOKIE, createSessionToken(key), {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE_MS,
      path: "/",
      sameSite: "lax",
      secure: secureCookies,
    });
    res.sendStatus(204);
  });

  return { gate, router };
};
