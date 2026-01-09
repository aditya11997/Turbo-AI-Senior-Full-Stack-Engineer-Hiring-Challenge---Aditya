export function storeToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("turbo_ai_token", token);
  }
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("turbo_ai_token");
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("turbo_ai_token");
  }
}
