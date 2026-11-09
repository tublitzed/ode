import type { SharedOde } from "#/shared/ode.ts";

const DESCRIPTION_LINES = 4;
const MAX_DESCRIPTION_LENGTH = 160;

const HTML_ESCAPES: Record<string, string> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&#39;",
  "<": "&lt;",
  ">": "&gt;",
};

const escapeHtml = (value: string) =>
  value.replace(/["&'<>]/g, (character) => HTML_ESCAPES[character] ?? "");

const describeOde = (ode: string) => {
  const opening = ode
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, DESCRIPTION_LINES)
    .join(" ");

  if (opening.length <= MAX_DESCRIPTION_LENGTH) {
    return opening;
  }

  return `${opening.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
};

export const renderPreview = (html: string, { ode, topic }: SharedOde) => {
  const title = escapeHtml(`Ode to ${topic}`);
  const description = escapeHtml(describeOde(ode));

  const tags = [
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:site_name" content="ode" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta name="description" content="${description}" />`,
  ].join("\n    ");

  return html
    .replace(/<title>.*?<\/title>/, () => `<title>${title} · ode</title>`)
    .replace("</head>", () => `  ${tags}\n  </head>`);
};
