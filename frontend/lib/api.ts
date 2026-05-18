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
  return raw ? JSON.parse(raw) as AuthSession : null;
};

export const storeSession = (session: AuthSession) => {
  window.localStorage.setItem("investment-intelligence-session", JSON.stringify(session));
};

export const clearSession = () => {
  window.localStorage.removeItem("investment-intelligence-session");
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const session = getStoredSession();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};
