import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createApp } from "@/server/app.ts";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/server/auth.ts";
import type { ServerContext } from "@/server/context.ts";

const PASSWORD = "correct horse";

const testContext: ServerContext = { db: {} as ServerContext["db"] };

const buildApp = (password = PASSWORD) => {
  vi.stubEnv("APP_PASSWORD", password);

  return createApp({
    context: testContext,
    isPublicPath: () => false,
    mountClient: () => {},
  });
};

const loginAndGetCookie = async () => {
  const app = await buildApp();
  const res = await request(app)
    .post("/api/login")
    .send({ password: PASSWORD });
  const [cookie] = res.get("Set-Cookie") ?? [];
  return { app, cookie: cookie?.split(";")[0] };
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/login", () => {
  it("returns 204 and sets a session cookie for the correct password", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/login")
      .send({ password: PASSWORD });

    expect(res.status).toBe(204);
    const [cookie] = res.get("Set-Cookie") ?? [];
    expect(cookie).toMatch(new RegExp(`^${SESSION_COOKIE}=\\d+\\.[\\w-]+;`));
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain(`Max-Age=${SESSION_MAX_AGE_MS / 1000}`);
    expect(cookie).not.toContain("Secure");
  });

  it("sets a Secure cookie in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const app = await buildApp();

    const res = await request(app)
      .post("/api/login")
      .send({ password: PASSWORD });

    const [cookie] = res.get("Set-Cookie") ?? [];
    expect(cookie).toContain("Secure");
  });

  it("accepts the password with surrounding whitespace", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/login")
      .send({ password: `  ${PASSWORD}\n` });

    expect(res.status).toBe(204);
  });

  it("trims the configured password too", async () => {
    const app = await buildApp(`  ${PASSWORD}  `);

    const res = await request(app)
      .post("/api/login")
      .send({ password: PASSWORD });

    expect(res.status).toBe(204);
  });

  it.each([
    ["a wrong password", { password: "nope" }],
    ["an empty password", { password: "" }],
    ["a whitespace-only password", { password: "   " }],
    ["a missing password", {}],
    ["a non-string password", { password: 123 }],
  ])("returns 401 for %s", async (_label, body) => {
    const app = await buildApp();

    const res = await request(app).post("/api/login").send(body);

    expect(res.status).toBe(401);
    expect(res.get("Set-Cookie")).toBeUndefined();
  });
});

describe("POST /api/logout", () => {
  it("returns 204 and expires the session cookie", async () => {
    const { app, cookie } = await loginAndGetCookie();

    const res = await request(app)
      .post("/api/logout")
      .set("Cookie", cookie ?? "");

    expect(res.status).toBe(204);
    const [cleared] = res.get("Set-Cookie") ?? [];
    expect(cleared).toMatch(new RegExp(`^${SESSION_COOKIE}=;`));
    expect(cleared).toContain("Path=/");
    expect(cleared).toContain("Expires=Thu, 01 Jan 1970");
  });

  it("works without a session so a stale cookie can always be cleared", async () => {
    const app = await buildApp();

    const res = await request(app).post("/api/logout");

    expect(res.status).toBe(204);
    expect(res.get("Set-Cookie")?.[0]).toMatch(
      new RegExp(`^${SESSION_COOKIE}=;`),
    );
  });
});
