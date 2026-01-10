import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from "./auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

type ApiOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function tryRefreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    return null;
  }

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refresh })
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { access: string };
  storeTokens(data.access, refresh);
  return data.access;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}) {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retry = await fetch(`${API_BASE}${path}`, {
        method: options.method ?? "GET",
        headers: { ...headers, Authorization: `Bearer ${refreshed}` },
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      if (!retry.ok) {
        throw new Error(await retry.text());
      }

      return (await retry.json()) as T;
    }

    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" })
};

export type AuthResponse = {
  user: { id: number; email: string };
  tokens: { access: string; refresh: string };
  ui?: { has_notes: boolean; default_category: string; landing_route: string };
};

export function registerUser(email: string, password: string) {
  return api.post<AuthResponse>("/auth/register", { email, password });
}
