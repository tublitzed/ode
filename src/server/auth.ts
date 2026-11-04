import { parseCookie } from "cookie";
import type { Request, RequestHandler } from "express";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { extname, posix } from "node:path";

export const SESSION_COOKIE = "ode_session";
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const PUBLIC_PATHS = new Set(["/api/login", "/login"]);

export type IsPublicPath = (path: string) => boolean;

const sha256 = (value: string) => createHash("sha256").update(value).digest();

export const safeEqual = (a: string, b: string) =>
  timingSafeEqual(sha256(a), sha256(b));

const sign = (key: Buffer, value: string) =>
  createHmac("sha256", key).update(value).digest("base64url");

export const deriveSessionKey = (password: string) =>
  sha256(`session:${password}`);

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

  if (!safeEqual(signature, sign(key, issuedAt))) {
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
    return posix.normalize(decodeURIComponent(path));
  } catch {
    return undefined;
  }
};

export const isDevPublicPath: IsPublicPath = (path) =>
  !path.startsWith("/api/") && (path.startsWith("/@") || extname(path) !== "");

const isPageRequest = (req: Request, path: string) => {
  if (req.method !== "GET" || path.startsWith("/api/")) {
    return false;
  }

  return (
    req.headers.accept?.includes("text/html") === true || extname(path) === ""
  );
};

export const getAuthConfig = () => {
  const expectedPassword = process.env.APP_PASSWORD?.trim();
  if (!expectedPassword) {
    throw new Error("APP_PASSWORD must be set to a non-blank value.");
  }

  return { expectedPassword, key: deriveSessionKey(expectedPassword) };
};

export const createGate = (isPublicPath: IsPublicPath) => {
  const { key } = getAuthConfig();

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

  return gate;
};
