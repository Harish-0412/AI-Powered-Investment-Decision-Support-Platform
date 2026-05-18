export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export type AuthSession = {
  accessToken: string;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    riskLevel?: string;
  };
};

export const getStoredSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("investment-intelligence-session");
  return raw ? (JSON.parse(raw) as AuthSession) : null;
};

export const storeSession = (session: AuthSession) => {
  window.localStorage.setItem("investment-intelligence-session", JSON.stringify(session));
};

export const clearSession = () => {
  window.localStorage.removeItem("investment-intelligence-session");
};

// Attempt a silent token refresh using the httpOnly refresh cookie.
// Returns the new access token on success, null on failure.
let refreshPromise: Promise<string | null> | null = null;

const silentRefresh = (): Promise<string | null> => {
  // Deduplicate concurrent refresh calls
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
    .then(async (res) => {
      if (!res.ok) {
        clearSession();
        return null;
      }
      const data = (await res.json()) as AuthSession;
      storeSession(data);
      return data.accessToken;
    })
    .catch(() => {
      clearSession();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

const buildHeaders = (accessToken?: string, extra?: HeadersInit): HeadersInit => ({
  "Content-Type": "application/json",
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  ...(extra ?? {}),
});

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const session = getStoredSession();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: buildHeaders(session?.accessToken, options.headers),
  });

  // Token expired — try a silent refresh then retry once
  if (response.status === 401) {
    const newToken = await silentRefresh();

    if (!newToken) {
      // Refresh failed — redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
      throw new Error("Session expired. Please sign in again.");
    }

    // Retry original request with the new token
    const retried = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: buildHeaders(newToken, options.headers),
    });

    if (!retried.ok) {
      const err = await retried.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message || "Request failed");
    }

    if (retried.status === 204) return undefined as T;
    return retried.json() as Promise<T>;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};
