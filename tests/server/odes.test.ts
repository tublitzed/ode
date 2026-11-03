import {
  APIConnectionError,
  APIConnectionTimeoutError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import { captureException } from "@sentry/node";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "@/server/app.ts";
import {
  createSessionToken,
  deriveSessionKey,
  SESSION_COOKIE,
} from "@/server/auth.ts";
import type { GenerateOde } from "@/server/generateOde.ts";
import { MAX_TOPIC_LENGTH } from "@/shared/ode.ts";

vi.mock("@sentry/node", () => ({ captureException: vi.fn() }));

const PASSWORD = "correct horse";
const SECRET_DETAIL = "secret detail";

const sessionCookie = `${SESSION_COOKIE}=${createSessionToken(deriveSessionKey(PASSWORD))}`;

const buildApp = async () => {
  const generateOde = vi.fn<GenerateOde>(async () => ({
    ode: "O tomato,\nstar of earth",
    status: "ode",
  }));
  const app = await createApp({
    generateOde,
    isPublicPath: () => false,
    mountClient: () => {},
    password: PASSWORD,
    secureCookies: false,
  });
  return { app, generateOde };
};

beforeEach(() => {
  vi.mocked(captureException).mockClear();
});

describe("POST /api/odes failures", () => {
  const headers = new Headers();

  it.each([
    [
      "a connection failure",
      new APIConnectionError({ message: SECRET_DETAIL }),
      502,
    ],
    [
      "a timeout",
      new APIConnectionTimeoutError({ message: SECRET_DETAIL }),
      502,
    ],
    [
      "a server error",
      new InternalServerError(500, undefined, SECRET_DETAIL, headers),
      502,
    ],
    [
      "a rate limit",
      new RateLimitError(429, undefined, SECRET_DETAIL, headers),
      503,
    ],
    [
      "an overload",
      new InternalServerError(529, undefined, SECRET_DETAIL, headers),
      503,
    ],
  ])(
    "maps %s to a retryable status without reporting it",
    async (_label, error, status) => {
      const { app, generateOde } = await buildApp();
      generateOde.mockRejectedValueOnce(error);

      const res = await request(app)
        .post("/api/odes")
        .set("Cookie", sessionCookie)
        .send({ topic: "Tomatoes" });

      expect(res.status).toBe(status);
      expect(res.body.error).toEqual(expect.any(String));
      expect(res.text).not.toContain(SECRET_DETAIL);
      expect(captureException).not.toHaveBeenCalled();
    },
  );

  it.each([
    [
      "a bad API key",
      new AuthenticationError(401, undefined, SECRET_DETAIL, headers),
    ],
    [
      "an invalid request",
      new BadRequestError(400, undefined, SECRET_DETAIL, headers),
    ],
    ["an unusable response", new Error(SECRET_DETAIL)],
  ])("reports %s and returns 500", async (_label, error) => {
    const { app, generateOde } = await buildApp();
    generateOde.mockRejectedValueOnce(error);

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({ topic: "Tomatoes" });

    expect(res.status).toBe(500);
    expect(res.body.error).toEqual(expect.any(String));
    expect(res.text).not.toContain(SECRET_DETAIL);
    expect(captureException).toHaveBeenCalledWith(error);
  });
});

describe("POST /api/odes", () => {
  it("returns the generated ode", async () => {
    const { app, generateOde } = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({ topic: "Tomatoes" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ode: "O tomato,\nstar of earth",
      status: "ode",
    });
    expect(generateOde).toHaveBeenCalledWith("Tomatoes");
  });

  it("returns a decline with suggestions without reporting it", async () => {
    const { app, generateOde } = await buildApp();
    const declined = {
      reason: "That's not a subject for an ode.",
      status: "declined" as const,
      suggestions: ["Tomatoes", "Rain", "My mug"],
    };
    generateOde.mockResolvedValueOnce(declined);

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({ topic: "asdfghjkl" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(declined);
    expect(captureException).not.toHaveBeenCalled();
  });

  it("trims the topic before generating", async () => {
    const { app, generateOde } = await buildApp();

    await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({ topic: "  Tomatoes\n" });

    expect(generateOde).toHaveBeenCalledWith("Tomatoes");
  });

  it("accepts a topic at the maximum length", async () => {
    const { app } = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({ topic: "a".repeat(MAX_TOPIC_LENGTH) });

    expect(res.status).toBe(200);
  });

  it("returns 401 without a session", async () => {
    const { app, generateOde } = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .send({ topic: "Tomatoes" });

    expect(res.status).toBe(401);
    expect(generateOde).not.toHaveBeenCalled();
  });

  it.each([
    ["a missing topic", {}],
    ["an empty topic", { topic: "" }],
    ["a whitespace-only topic", { topic: "   " }],
    ["a non-string topic", { topic: 123 }],
    ["a too-long topic", { topic: "a".repeat(MAX_TOPIC_LENGTH + 1) }],
  ])("returns 400 for %s", async (_label, body) => {
    const { app, generateOde } = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain(String(MAX_TOPIC_LENGTH));
    expect(generateOde).not.toHaveBeenCalled();
  });
});
