const FALLBACK_PATH = "/";
const PARSE_BASE = "http://same-origin.invalid";

export const safeNextPath = (next: string | null) => {
  if (!next?.startsWith("/")) {
    return FALLBACK_PATH;
  }

  const url = new URL(next, PARSE_BASE);
  if (url.origin !== PARSE_BASE || url.pathname === "/login") {
    return FALLBACK_PATH;
  }

  return `${url.pathname}${url.search}${url.hash}`;
};
