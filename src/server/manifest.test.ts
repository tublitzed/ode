import { describe, expect, it } from "vitest";

import { collectEntryFiles } from "./manifest.ts";
import type { Manifest } from "./manifest.ts";

const manifest: Manifest = {
  "_shared-react.js": { file: "assets/shared-react.js" },
  "_shared-ui.js": {
    css: ["assets/shared-ui.css"],
    file: "assets/shared-ui.js",
    imports: ["_shared-react.js"],
  },
  "index.html": {
    css: ["assets/app.css"],
    file: "assets/app.js",
    imports: ["_shared-ui.js"],
  },
  "login.html": {
    assets: ["assets/logo.svg"],
    css: ["assets/login.css"],
    file: "assets/login.js",
    imports: ["_shared-ui.js", "_shared-react.js"],
  },
};

describe("collectEntryFiles", () => {
  it("collects the entry's file, css, assets, and transitive imports as URL paths", () => {
    expect(collectEntryFiles(manifest, "login.html")).toEqual(
      new Set([
        "/assets/login.js",
        "/assets/login.css",
        "/assets/logo.svg",
        "/assets/shared-ui.js",
        "/assets/shared-ui.css",
        "/assets/shared-react.js",
      ]),
    );
  });

  it("excludes files only used by other entries", () => {
    const files = collectEntryFiles(manifest, "login.html");

    expect(files.has("/assets/app.js")).toBe(false);
    expect(files.has("/assets/app.css")).toBe(false);
  });

  it("handles import cycles", () => {
    const cyclic: Manifest = {
      "_a.js": { file: "assets/a.js", imports: ["_b.js"] },
      "_b.js": { file: "assets/b.js", imports: ["_a.js"] },
      "login.html": { file: "assets/login.js", imports: ["_a.js"] },
    };

    expect(collectEntryFiles(cyclic, "login.html")).toEqual(
      new Set(["/assets/login.js", "/assets/a.js", "/assets/b.js"]),
    );
  });

  it("throws when the entry is missing", () => {
    expect(() => collectEntryFiles(manifest, "missing.html")).toThrow(
      "missing.html",
    );
  });
});
