import type { Method, Run } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

type CreateRunPayload = {
  equation: string;
  xl: number;
  xr: number;
  epsilon: number;
  maxIterations: number;
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(data?.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function fetchMethods() {
  const response = await fetch(`${API_BASE_URL}/methods`);
  return parseJson<Method[]>(response);
}

export async function fetchRuns() {
  const response = await fetch(`${API_BASE_URL}/runs?limit=6`);
  return parseJson<Run[]>(response);
}

export async function createRun(methodKey: Method["key"], payload: CreateRunPayload) {
  const response = await fetch(`${API_BASE_URL}/runs/${methodKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseJson<Run>(response);
}

