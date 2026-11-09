import { captureException } from "@sentry/node";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "@/server/app.ts";
import type { ServerContext } from "@/server/context.ts";
import { getSharedOde } from "@/server/shares/store.ts";

vi.mock("@sentry/node", () => ({ captureException: vi.fn() }));
vi.mock("@/server/shares/store.ts", () => ({ getSharedOde: vi.fn() }));

const ODE = "O tomato,\nstar of earth";
const SECRET_DETAIL = "secret detail";
const SHARE_ID = "x7Kq2mPa9LwR";
const TOPIC = "Tomatoes";

const testContext: ServerContext = { db: {} as ServerContext["db"] };

const mockGetSharedOde = vi.mocked(getSharedOde);

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
  vi.stubEnv("APP_PASSWORD", "correct horse");
  vi.mocked(captureException).mockClear();
  mockGetSharedOde.mockReset();
});

describe("GET /api/public/shares/:id", () => {
  it("returns the shared ode", async () => {
    const app = await buildApp();
    mockGetSharedOde.mockResolvedValueOnce({ ode: ODE, topic: TOPIC });

    const res = await request(app).get(`/api/public/shares/${SHARE_ID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ode: ODE, topic: TOPIC });
    expect(mockGetSharedOde).toHaveBeenCalledWith(testContext.db, SHARE_ID);
  });

  it("returns 404 for an unknown id", async () => {
    const app = await buildApp();
    mockGetSharedOde.mockResolvedValueOnce(undefined);

    const res = await request(app).get("/api/public/shares/unknown");

    expect(res.status).toBe(404);
    expect(res.body.error).toEqual(expect.any(String));
  });

  it("reports a store failure without leaking details", async () => {
    const app = await buildApp();
    const error = new Error(SECRET_DETAIL);
    mockGetSharedOde.mockRejectedValueOnce(error);

    const res = await request(app).get(`/api/public/shares/${SHARE_ID}`);

    expect(res.status).toBe(500);
    expect(res.text).not.toContain(SECRET_DETAIL);
    expect(captureException).toHaveBeenCalledWith(error);
  });
});
