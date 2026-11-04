const GENERIC_ERROR = "Something went wrong. Try again.";
const NETWORK_ERROR =
  "We couldn't reach Ode. Check your connection and try again.";

type HttpRequestOptions = {
  body?: unknown;
  method?: string;
};

export type HttpResult<T> =
  { data: T; ok: true } | { message: string; ok: false; status?: number };

const readJson = async (res: Response) => {
  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
};

export const httpRequest = async <T>(
  path: string,
  { body, method = "GET" }: HttpRequestOptions = {},
): Promise<HttpResult<T>> => {
  let res: Response;

  try {
    res = await fetch(path, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      method,
    });
  } catch {
    return { message: NETWORK_ERROR, ok: false };
  }

  try {
    const data = await readJson(res);

    if (res.ok) {
      return { data, ok: true };
    }

    const message =
      typeof data?.error === "string" ? data.error : GENERIC_ERROR;
    return { message, ok: false, status: res.status };
  } catch {
    return { message: GENERIC_ERROR, ok: false, status: res.status };
  }
};
