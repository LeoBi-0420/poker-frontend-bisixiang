import { ENV } from "./env";

function backendUrl(path: string): string {
  return `${ENV.apiServer}${path}`;
}

export async function postBackend(path: string, payload: unknown): Promise<Response> {
  return fetch(backendUrl(path), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}

export async function deleteBackend(path: string): Promise<Response> {
  return fetch(backendUrl(path), {
    method: "DELETE",
    cache: "no-store",
  });
}
