import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createApp } from "@/server/app.ts";
import {
  createSessionToken,
  deriveSessionKey,
  isDevPublicPath,
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
} from "@/server/auth.ts";
import { getSharedOde } from "@/server/shares/store.ts";

vi.mock("@/server/shares/store.ts", () => ({
  createSharedOde: vi.fn(),
  getSharedOde: vi.fn(),
}));

const PASSWORD = "correct horse";

const isTestPublicPath = (path: string) => path.startsWith("/public/");

const buildApp = (password = PASSWORD) => {
  vi.stubEnv("APP_PASSWORD", password);

  return createApp({
    isPublicPath: isTestPublicPath,
    mountClient: (app) => {
      app.use((_req, res) => {
        res.type("html").send("client");
      });
    },
  });
};

const sessionCookieFor = (password: string, now = Date.now()) =>
  `${SESSION_COOKIE}=${createSessionToken(deriveSessionKey(password), now)}`;

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
  vi.useRealTimers();
});

describe("createApp", () => {
  it("throws when the password is missing", async () => {
    vi.stubEnv("APP_PASSWORD", undefined);

    await expect(
      createApp({
        isPublicPath: isTestPublicPath,
        mountClient: () => {},
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

  it("returns 401 for a non-public file", async () => {
    const app = await buildApp();

    const res = await request(app).get("/private/app.js");

    expect(res.status).toBe(401);
  });

  it("returns 401 for a non-public file reached via path traversal", async () => {
    const app = await buildApp();

    const res = await request(app).get("/public/%2E%2E/private/app.js");

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

  it("lets a public path through without a session", async () => {
    const app = await buildApp();

    const res = await request(app).get("/public/login.js");

    expect(res.status).toBe(200);
  });
});

describe("shared odes without a session", () => {
  it("serves the share page with a noindex header", async () => {
    const app = await buildApp();

    const res = await request(app).get("/o/x7Kq2mPa9LwR");

    expect(res.status).toBe(200);
    expect(res.text).toBe("client");
    expect(res.headers["x-robots-tag"]).toBe("noindex");
  });

  it("serves the share API with a noindex header", async () => {
    const app = await buildApp();
    const sharedOde = { ode: "O tomato", topic: "Tomatoes" };
    vi.mocked(getSharedOde).mockResolvedValueOnce(sharedOde);

    const res = await request(app).get("/api/shares/x7Kq2mPa9LwR");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sharedOde);
    expect(res.headers["x-robots-tag"]).toBe("noindex");
  });

  it("doesn't add the noindex header to other pages", async () => {
    const app = await buildApp();

    const res = await request(app).get("/login");

    expect(res.headers["x-robots-tag"]).toBeUndefined();
  });

  it.each([
    ["creating a share", "post", "/api/shares"],
    ["listing shares", "get", "/api/shares"],
    ["a nested share API path", "get", "/api/shares/a/b"],
    ["an encoded nested share API path", "get", "/api/shares/a%2Fb"],
    ["deleting a share", "delete", "/api/shares/x7Kq2mPa9LwR"],
    ["updating a share", "put", "/api/shares/x7Kq2mPa9LwR"],
    ["posting to a share page", "post", "/o/x7Kq2mPa9LwR"],
    [
      "traversal from the share API to another API",
      "get",
      "/api/shares/x/%2E%2E/%2E%2E/odes",
    ],
  ] as const)("returns 401 for %s", async (_label, method, path) => {
    const app = await buildApp();

    const res = await request(app)[method](path);

    expect(res.status).toBe(401);
    expect(res.headers["x-robots-tag"]).toBeUndefined();
  });

  it.each([
    ["the share page root", "/o/"],
    ["the share page root without a slash", "/o"],
    ["a nested share page", "/o/a/b"],
    ["an encoded nested share page", "/o/a%2Fb"],
    ["a trailing slash", "/o/x7Kq2mPa9LwR/"],
    ["traversal out of the share page", "/o/%2E%2E/"],
    ["traversal into the share page", "/private/%2E%2E/o/x7Kq2mPa9LwR"],
    ["traversal between share pages", "/o/x/%2E%2E/y"],
  ])("redirects %s to login", async (_label, path) => {
    const app = await buildApp();

    const res = await request(app).get(path);

    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^\/login\?next=/);
  });
});

describe("isDevPublicPath", () => {
  it.each([
    "/@vite/client",
    "/@react-refresh",
    "/node_modules/.vite/deps/react.js",
    "/src/client/main.tsx",
    "/src/client/index.css",
  ])("treats file %s as public", (path) => {
    expect(isDevPublicPath(path)).toBe(true);
  });

  it.each(["/", "/foo", "/login/", "/api/anything", "/api/data.json"])(
    "keeps %s behind the login",
    (path) => {
      expect(isDevPublicPath(path)).toBe(false);
    },
  );
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
      .get("/private/app.js")
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
      .set("Cookie", `${SESSION_COOKIE}=${Number(issuedAt) + 1}.${signature}`);

    expect(res.status).toBe(401);
  });

  it.each(["", "garbage", "123", "123.", ".abc", "1.2.3"])(
    "rejects a malformed token %j",
    async (token) => {
      const app = await buildApp();

      const res = await request(app)
        .get("/api/anything")
        .set("Cookie", `${SESSION_COOKIE}=${token}`);

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
