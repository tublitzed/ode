import { describe, expect, it } from "vitest";

import { safeNextPath } from "./safeNextPath";

describe("safeNextPath", () => {
  it.each([
    ["/", "/"],
    ["/foo", "/foo"],
    ["/foo?x=1#bar", "/foo?x=1#bar"],
  ])("keeps same-site path %j", (next, expected) => {
    expect(safeNextPath(next)).toBe(expected);
  });

  it.each([
    ["missing", null],
    ["empty", ""],
    ["protocol-relative", "//evil.com"],
    ["backslash protocol-relative", "/\\evil.com"],
    ["absolute URL", "https://evil.com"],
    ["javascript URL", "javascript:alert(1)"],
    ["relative path", "foo"],
    ["login page", "/login"],
    ["login page with query", "/login?next=%2F"],
  ])("falls back to / for %s", (_label, next) => {
    expect(safeNextPath(next)).toBe("/");
  });
});
