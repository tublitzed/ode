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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "@/server/app.ts";
import {
  createSessionToken,
  deriveSessionKey,
  SESSION_COOKIE,
} from "@/server/auth.ts";
import type { ServerContext } from "@/server/context.ts";
import { generateOde } from "@/server/odes/generate.ts";
import {
  MAX_CHANGE_REQUEST_LENGTH,
  MAX_CHANGE_REQUESTS,
  MAX_ODE_LENGTH,
  MAX_TOPIC_LENGTH,
} from "@/shared/ode.ts";

vi.mock("@sentry/node", () => ({ captureException: vi.fn() }));
vi.mock("@/server/odes/generate.ts", () => ({ generateOde: vi.fn() }));

const PASSWORD = "correct horse";
const SECRET_DETAIL = "secret detail";

const testContext: ServerContext = { db: {} as ServerContext["db"] };

const sessionCookie = `${SESSION_COOKIE}=${createSessionToken(deriveSessionKey(PASSWORD))}`;

const mockGenerateOde = vi.mocked(generateOde);

const buildApp = () =>
  createApp({
    context: testContext,
    isPublicPath: () => false,
    mountClient: () => {},
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

beforeEach(() => {
  vi.stubEnv("APP_PASSWORD", PASSWORD);
  vi.mocked(captureException).mockClear();
  mockGenerateOde.mockReset();
  mockGenerateOde.mockResolvedValue({
    ode: "O tomato,\nstar of earth",
    status: "ode",
  });
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
      const app = await buildApp();
      mockGenerateOde.mockRejectedValueOnce(error);

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
    const app = await buildApp();
    mockGenerateOde.mockRejectedValueOnce(error);

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
    const app = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({ topic: "Tomatoes" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ode: "O tomato,\nstar of earth",
      status: "ode",
    });
    expect(mockGenerateOde).toHaveBeenCalledWith("Tomatoes", "irregular", {});
  });

  it("returns a decline with suggestions without reporting it", async () => {
    const app = await buildApp();
    const declined = {
      reason: "That's not a subject for an ode.",
      status: "declined" as const,
      suggestions: ["Tomatoes", "Rain", "My mug"],
    };
    mockGenerateOde.mockResolvedValueOnce(declined);

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({ topic: "asdfghjkl" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(declined);
    expect(captureException).not.toHaveBeenCalled();
  });

  it("trims the topic before generating", async () => {
    const app = await buildApp();

    await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({ topic: "  Tomatoes\n" });

    expect(mockGenerateOde).toHaveBeenCalledWith("Tomatoes", "irregular", {});
  });

  it("accepts a topic at the maximum length", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({ topic: "a".repeat(MAX_TOPIC_LENGTH) });

    expect(res.status).toBe(200);
  });

  it("passes the requested type and source ode to the generator", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({ sourceOde: "O tomato", topic: "Tomatoes", type: "horatian" });

    expect(res.status).toBe(200);
    expect(mockGenerateOde).toHaveBeenCalledWith("Tomatoes", "horatian", {
      sourceOde: "O tomato",
    });
  });

  it.each([
    ["an unknown type", { type: "sonnet" }],
    ["a non-string type", { type: 42 }],
    ["a non-string source ode", { sourceOde: 42 }],
    ["a whitespace-only source ode", { sourceOde: "   " }],
    ["a too-long source ode", { sourceOde: "a".repeat(MAX_ODE_LENGTH + 1) }],
    ["change requests without a previous ode", { changeRequests: ["Shorter"] }],
    ["a previous ode without change requests", { previousOde: "O tomato" }],
    [
      "a non-string previous ode",
      { changeRequests: ["Shorter"], previousOde: 42 },
    ],
    [
      "a too-long previous ode",
      {
        changeRequests: ["Shorter"],
        previousOde: "a".repeat(MAX_ODE_LENGTH + 1),
      },
    ],
    [
      "change requests that aren't an array",
      { changeRequests: "Shorter", previousOde: "O tomato" },
    ],
    ["empty change requests", { changeRequests: [], previousOde: "O tomato" }],
    [
      "too many change requests",
      {
        changeRequests: Array(MAX_CHANGE_REQUESTS + 1).fill("Shorter"),
        previousOde: "O tomato",
      },
    ],
    [
      "a non-string change request",
      { changeRequests: [42], previousOde: "O tomato" },
    ],
    [
      "a whitespace-only change request",
      { changeRequests: ["   "], previousOde: "O tomato" },
    ],
    [
      "a too-long change request",
      {
        changeRequests: ["a".repeat(MAX_CHANGE_REQUEST_LENGTH + 1)],
        previousOde: "O tomato",
      },
    ],
    [
      "a revision with a source ode",
      {
        changeRequests: ["Shorter"],
        previousOde: "O tomato",
        sourceOde: "O tomato",
      },
    ],
  ])("returns 400 for %s", async (_label, body) => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({ topic: "Tomatoes", ...body });

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
    expect(mockGenerateOde).not.toHaveBeenCalled();
  });

  it("accepts a source ode at the maximum length", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({
        sourceOde: "a".repeat(MAX_ODE_LENGTH),
        topic: "Tomatoes",
        type: "pindaric",
      });

    expect(res.status).toBe(200);
  });

  it("passes a trimmed revision to the generator", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({
        changeRequests: ["Keep it short", "  Mention basil  "],
        previousOde: "O tomato",
        topic: "Tomatoes",
      });

    expect(res.status).toBe(200);
    expect(mockGenerateOde).toHaveBeenCalledWith("Tomatoes", "irregular", {
      revision: {
        changeRequests: ["Keep it short", "Mention basil"],
        previousOde: "O tomato",
      },
    });
  });

  it("accepts the maximum number of change requests at the maximum length", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send({
        changeRequests: Array(MAX_CHANGE_REQUESTS).fill(
          "a".repeat(MAX_CHANGE_REQUEST_LENGTH),
        ),
        previousOde: "O tomato",
        topic: "Tomatoes",
      });

    expect(res.status).toBe(200);
  });

  it("returns 401 without a session", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .send({ topic: "Tomatoes" });

    expect(res.status).toBe(401);
    expect(mockGenerateOde).not.toHaveBeenCalled();
  });

  it.each([
    ["a missing topic", {}],
    ["an empty topic", { topic: "" }],
    ["a whitespace-only topic", { topic: "   " }],
    ["a non-string topic", { topic: 123 }],
    ["a too-long topic", { topic: "a".repeat(MAX_TOPIC_LENGTH + 1) }],
  ])("returns 400 for %s", async (_label, body) => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/odes")
      .set("Cookie", sessionCookie)
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain(String(MAX_TOPIC_LENGTH));
    expect(mockGenerateOde).not.toHaveBeenCalled();
  });
});
