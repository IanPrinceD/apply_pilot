// src\utils\apiFetch.ts

/** fetch wrapper for our API routes: JSON in/out, throws with the server's `error` message. */
export const apiFetch = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const isForm = init?.body instanceof FormData;
  const res = await fetch(url, {
    ...init,
    headers: isForm ? init?.headers : { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
};
