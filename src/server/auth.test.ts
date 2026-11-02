import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createApp } from "./app.ts";
import {
  createSessionToken,
  deriveSessionKey,
  isDevPublicPath,
  SESSION_MAX_AGE_MS,
} from "./auth.ts";

const PASSWORD = "correct horse";

const buildApp = (password = PASSWORD) =>
  createApp({
    isPublicPath: isDevPublicPath,
    mountClient: (app) => {
      app.use((_req, res) => {
        res.type("html").send("client");
      });
    },
    password,
    secureCookies: false,
  });

const sessionCookieFor = (password: string, now = Date.now()) =>
  `session=${createSessionToken(deriveSessionKey(password), now)}`;

const loginAndGetCookie = async () => {
  const app = await buildApp();
  const res = await request(app)
    .post("/api/login")
    .send({ password: PASSWORD });
  const [cookie] = res.get("Set-Cookie") ?? [];
  return { app, cookie: cookie?.split(";")[0] };
};

afterEach(() => {
  vi.useRealTimers();
});

describe("createApp", () => {
  it("throws when the password is missing", async () => {
    await expect(
      createApp({
        isPublicPath: isDevPublicPath,
        mountClient: () => {},
        password: undefined,
        secureCookies: false,
      }),
    ).rejects.toThrow("APP_PASSWORD");
  });

  it("throws when the password is blank after trimming", async () => {
    await expect(buildApp("   ")).rejects.toThrow("APP_PASSWORD");
  });
});

describe("session gate without a cookie", () => {
  it("redirects a browser page request to /login with next", async () => {
    const app = await buildApp();

    const res = await request(app).get("/").set("Accept", "text/html");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login?next=%2F");
  });

  it("keeps the query string in next", async () => {
    const app = await buildApp();

    const res = await request(app).get("/foo?x=1");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login?next=%2Ffoo%3Fx%3D1");
  });

  it("returns 401 for app code", async () => {
    const app = await buildApp();

    const res = await request(app).get("/src/client/app/main.tsx");

    expect(res.status).toBe(401);
  });

  it("returns 401 for app code reached via path traversal", async () => {
    const app = await buildApp();

    const res = await request(app).get("/src/client/login/%2E%2E/app/main.tsx");

    expect(res.status).toBe(401);
  });

  it("returns 401 for app code requested with different casing", async () => {
    const app = await buildApp();

    const res = await request(app).get("/src/Client/App/main.tsx");

    expect(res.status).toBe(401);
  });

  it("returns 401 for server source", async () => {
    const app = await buildApp();

    const res = await request(app).get("/src/server/auth.ts");

    expect(res.status).toBe(401);
  });

  it("returns 401 for API requests", async () => {
    const app = await buildApp();

    const res = await request(app).get("/api/anything");

    expect(res.status).toBe(401);
  });

  it("returns 401 for non-GET requests", async () => {
    const app = await buildApp();

    const res = await request(app).post("/");

    expect(res.status).toBe(401);
  });

  it("returns 400 for a malformed encoded path", async () => {
    const app = await buildApp();

    const res = await request(app).get("/%E0%A4%A");

    expect(res.status).toBe(400);
  });
});

describe("public paths", () => {
  it("serves /login without a session", async () => {
    const app = await buildApp();

    const res = await request(app).get("/login");

    expect(res.status).toBe(200);
  });

  it.each([
    "/@vite/client",
    "/node_modules/.vite/deps/react.js",
    "/src/client/login/main.tsx",
    "/src/components/ui/button.tsx",
    "/src/index.css",
    "/src/lib/utils.ts",
  ])("lets %s through without a session", async (path) => {
    const app = await buildApp();

    const res = await request(app).get(path);

    expect(res.status).toBe(200);
  });
});

describe("POST /api/login", () => {
  it("returns 204 and sets a session cookie for the correct password", async () => {
    const app = await buildApp();

    const res = await request(app)
      .post("/api/login")
      .send({ password: PASSWORD });

    expect(res.status).toBe(204);
    const [cookie] = res.get("Set-Cookie") ?? [];
    expect(cookie).toMatch(/^session=\d+\.[\w-]+;/);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain(`Max-Age=${SESSION_MAX_AGE_MS / 1000}`);
    expect(cookie).not.toContain("Secure");
  });

  it("sets a Secure cookie when secureCookies is on", async () => {
    const app = await createApp({
      isPublicPath: isDevPublicPath,
      mountClient: () => {},
      password: PASSWORD,
      secureCookies: true,
    });

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

describe("session gate with a cookie", () => {
  it("lets a request with the login cookie through", async () => {
    const { app, cookie } = await loginAndGetCookie();

    const res = await request(app)
      .get("/")
      .set("Cookie", cookie ?? "");

    expect(res.status).toBe(200);
    expect(res.text).toBe("client");
  });

  it("lets app code through with a valid cookie", async () => {
    const app = await buildApp();

    const res = await request(app)
      .get("/src/client/app/main.tsx")
      .set("Cookie", sessionCookieFor(PASSWORD));

    expect(res.status).toBe(200);
  });

  it("rejects a cookie with a tampered signature", async () => {
    const app = await buildApp();
    const cookie = sessionCookieFor(PASSWORD);
    const tampered = `${cookie.slice(0, -1)}${cookie.endsWith("A") ? "B" : "A"}`;

    const res = await request(app).get("/api/anything").set("Cookie", tampered);

    expect(res.status).toBe(401);
  });

  it("rejects a cookie with a tampered issuedAt", async () => {
    const app = await buildApp();
    const [issuedAt, signature] = createSessionToken(
      deriveSessionKey(PASSWORD),
    ).split(".");

    const res = await request(app)
      .get("/api/anything")
      .set("Cookie", `session=${Number(issuedAt) + 1}.${signature}`);

    expect(res.status).toBe(401);
  });

  it.each(["", "garbage", "123", "123.", ".abc", "1.2.3"])(
    "rejects a malformed token %j",
    async (token) => {
      const app = await buildApp();

      const res = await request(app)
        .get("/api/anything")
        .set("Cookie", `session=${token}`);

      expect(res.status).toBe(401);
    },
  );

  it("rejects a cookie signed with a different password", async () => {
    const app = await buildApp();

    const res = await request(app)
      .get("/api/anything")
      .set("Cookie", sessionCookieFor("old password"));

    expect(res.status).toBe(401);
  });

  it("rejects a cookie issued in the future", async () => {
    const app = await buildApp();

    const res = await request(app)
      .get("/api/anything")
      .set("Cookie", sessionCookieFor(PASSWORD, Date.now() + 60_000));

    expect(res.status).toBe(401);
  });

  it("accepts a cookie just before it expires", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const { app, cookie } = await loginAndGetCookie();

    vi.setSystemTime(Date.now() + SESSION_MAX_AGE_MS - 1);
    const res = await request(app)
      .get("/api/anything")
      .set("Cookie", cookie ?? "");

    expect(res.status).toBe(200);
  });

  it("rejects a cookie once it has expired", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const { app, cookie } = await loginAndGetCookie();

    vi.setSystemTime(Date.now() + SESSION_MAX_AGE_MS);
    const res = await request(app)
      .get("/api/anything")
      .set("Cookie", cookie ?? "");

    expect(res.status).toBe(401);
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
    expect(cleared).toMatch(/^session=;/);
    expect(cleared).toContain("Path=/");
    expect(cleared).toContain("Expires=Thu, 01 Jan 1970");
  });

  it("works without a session so a stale cookie can always be cleared", async () => {
    const app = await buildApp();

    const res = await request(app).post("/api/logout");

    expect(res.status).toBe(204);
    expect(res.get("Set-Cookie")?.[0]).toMatch(/^session=;/);
  });
});
