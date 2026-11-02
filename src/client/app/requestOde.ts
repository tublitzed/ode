import type { OdeResponse } from "@/shared/ode";

const GENERIC_ERROR = "Something went wrong writing your ode. Try again.";
const NETWORK_ERROR =
  "We couldn't reach Ode. Check your connection and try again.";

type OdeRequestResult =
  | OdeResponse
  | { message: string; status: "error" }
  | { status: "unauthorized" };

const readErrorMessage = async (res: Response) => {
  try {
    const { error } = await res.json();
    return typeof error === "string" ? error : GENERIC_ERROR;
  } catch {
    return GENERIC_ERROR;
  }
};

export const requestOde = async (topic: string): Promise<OdeRequestResult> => {
  try {
    const res = await fetch("/api/odes", {
      body: JSON.stringify({ topic }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (res.status === 401) {
      return { status: "unauthorized" };
    }

    if (!res.ok) {
      return { message: await readErrorMessage(res), status: "error" };
    }

    return await res.json();
  } catch {
    return { message: NETWORK_ERROR, status: "error" };
  }
};
