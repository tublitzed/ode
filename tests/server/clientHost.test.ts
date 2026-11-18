import { captureException } from "@sentry/node";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPageHandler } from "@/server/clientHost.ts";
import { createContextMiddleware } from "@/server/context.ts";
import type { ServerContext } from "@/server/context.ts";
import { getSharedOde } from "@/server/shares/store.ts";

vi.mock("@sentry/node", () => ({ captureException: vi.fn() }));
vi.mock("@/server/shares/store.ts", () => ({ getSharedOde: vi.fn() }));

const HTML = "<html><head><title>ode</title></head><body>client</body></html>";
const SHARE_PATH = "/o/fc04fd725e865a95";

const testContext: ServerContext = { db: {} as ServerContext["db"] };

const mockGetSharedOde = vi.mocked(getSharedOde);

const buildApp = () => {
  const app = express();
  app.use(createContextMiddleware(testContext));
  app.use(createPageHandler(async () => HTML));
  return app;
};

beforeEach(() => {
  vi.mocked(captureException).mockClear();
  mockGetSharedOde.mockReset();
});

describe("page handler", () => {
  it("serves other pages without looking up a shared ode", async () => {
    const res = await request(buildApp()).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toBe(HTML);
    expect(mockGetSharedOde).not.toHaveBeenCalled();
  });

  it("adds preview tags for a shared ode", async () => {
    mockGetSharedOde.mockResolvedValueOnce({
      ode: "O tomato,\n\nwarm\nfrom the windowsill,\nyou sit there\nround",
      topic: "Tomatoes",
    });

    const res = await request(buildApp()).get(SHARE_PATH);

    expect(res.status).toBe(200);
    expect(res.text).toContain("<title>Ode to Tomatoes · Ode</title>");
    expect(res.text).toContain(
      '<meta property="og:title" content="Ode to Tomatoes" />',
    );
    expect(res.text).toContain(
      '<meta property="og:description" content="O tomato, warm from the windowsill, you sit there" />',
    );
    expect(res.text.indexOf("og:title")).toBeLessThan(
      res.text.indexOf("</head>"),
    );
  });

  it("escapes a hostile topic and ode", async () => {
    mockGetSharedOde.mockResolvedValueOnce({
      ode: `"><img src=x onerror=alert(1)>`,
      topic: `"><script>alert(1)</script>`,
    });

    const res = await request(buildApp()).get(SHARE_PATH);

    expect(res.text).not.toContain("<script>");
    expect(res.text).not.toContain("<img");
    expect(res.text).toContain(
      "&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });

  it("keeps replacement patterns in a topic literal", async () => {
    mockGetSharedOde.mockResolvedValueOnce({
      ode: "O money",
      topic: "$& and $'",
    });

    const res = await request(buildApp()).get(SHARE_PATH);

    expect(res.text).toContain("<title>Ode to $&amp; and $&#39; · Ode</title>");
  });

  it("truncates a long description", async () => {
    mockGetSharedOde.mockResolvedValueOnce({
      ode: "o".repeat(500),
      topic: "Tomatoes",
    });

    const res = await request(buildApp()).get(SHARE_PATH);

    expect(res.text).toContain(`content="${"o".repeat(159)}…"`);
  });

  it("returns 404 and the plain page for an unknown id", async () => {
    mockGetSharedOde.mockResolvedValueOnce(undefined);

    const res = await request(buildApp()).get(SHARE_PATH);

    expect(res.status).toBe(404);
    expect(res.text).toBe(HTML);
  });

  it("still serves the page when the database fails", async () => {
    const error = new Error("database down");
    mockGetSharedOde.mockRejectedValueOnce(error);

    const res = await request(buildApp()).get(SHARE_PATH);

    expect(res.status).toBe(200);
    expect(res.text).toBe(HTML);
    expect(captureException).toHaveBeenCalledWith(error);
  });
});
