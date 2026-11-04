import { captureException } from "@sentry/node";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "@/server/app.ts";
import {
  createSessionToken,
  deriveSessionKey,
  SESSION_COOKIE,
} from "@/server/auth.ts";
import { createSharedOde } from "@/server/shares/store.ts";
import { MAX_ODE_LENGTH, MAX_TOPIC_LENGTH } from "@/shared/ode.ts";

vi.mock("@sentry/node", () => ({ captureException: vi.fn() }));
vi.mock("@/server/shares/store.ts", () => ({ createSharedOde: vi.fn() }));

const ODE = "O tomato,\nstar of earth";
const PASSWORD = "correct horse";
const SECRET_DETAIL = "secret detail";
const SHARE_ID = "x7Kq2mPa9LwR";
const TOPIC = "Tomatoes";

const sessionCookie = `${SESSION_COOKIE}=${createSessionToken(deriveSessionKey(PASSWORD))}`;

const mockCreateSharedOde = vi.mocked(createSharedOde);

const buildApp = () =>
  createApp({
    isPublicPath: () => false,
    mountClient: () => {},
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

beforeEach(() => {
  vi.stubEnv("APP_PASSWORD", PASSWORD);
  vi.mocked(captureException).mockClear();
  mockCreateSharedOde.mockReset();
  mockCreateSharedOde.mockResolvedValue(SHARE_ID);
});

describe("POST /api/shares", () => {
  it("stores the trimmed ode and returns its id", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/shares")
      .set("Cookie", sessionCookie)
      .send({ ode: `  ${ODE}\n`, topic: `  ${TOPIC} ` });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: SHARE_ID });
    expect(mockCreateSharedOde).toHaveBeenCalledWith({
      ode: ODE,
      topic: TOPIC,
    });
  });

  it("accepts input at the length limits", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/shares")
      .set("Cookie", sessionCookie)
      .send({
        ode: "o".repeat(MAX_ODE_LENGTH),
        topic: "t".repeat(MAX_TOPIC_LENGTH),
      });

    expect(res.status).toBe(201);
  });

  it.each([
    ["a missing ode", { topic: TOPIC }],
    ["a missing topic", { ode: ODE }],
    ["a non-string ode", { ode: 1, topic: TOPIC }],
    ["a non-string topic", { ode: ODE, topic: ["Tomatoes"] }],
    ["a blank ode", { ode: "   ", topic: TOPIC }],
    ["a blank topic", { ode: ODE, topic: "   " }],
    ["a too-long ode", { ode: "o".repeat(MAX_ODE_LENGTH + 1), topic: TOPIC }],
    ["a too-long topic", { ode: ODE, topic: "t".repeat(MAX_TOPIC_LENGTH + 1) }],
  ])("rejects %s", async (_label, body) => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/shares")
      .set("Cookie", sessionCookie)
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
    expect(mockCreateSharedOde).not.toHaveBeenCalled();
  });

  it("requires a session", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/shares")
      .send({ ode: ODE, topic: TOPIC });

    expect(res.status).toBe(401);
    expect(mockCreateSharedOde).not.toHaveBeenCalled();
  });

  it("reports a store failure without leaking details", async () => {
    const app = await buildApp();
    const error = new Error(SECRET_DETAIL);
    mockCreateSharedOde.mockRejectedValueOnce(error);

    const res = await request(app)
      .post("/api/shares")
      .set("Cookie", sessionCookie)
      .send({ ode: ODE, topic: TOPIC });

    expect(res.status).toBe(500);
    expect(res.body.error).toEqual(expect.any(String));
    expect(res.text).not.toContain(SECRET_DETAIL);
    expect(captureException).toHaveBeenCalledWith(error);
  });
});
