"use client";

const API_BASE = "/api/v1";
const SESSION_KEY = "abegdrive_session";

export interface Session {
  userId: string;
  phone?: string;
  accessToken: string;
  refreshToken: string;
  role: string;
}

export function saveSession(session: Session) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(SESSION_KEY);
  }
}

// Prevents multiple simultaneous 401s (e.g. several components fetching on
// mount) from each independently calling /auth/refresh-token — since the
// refresh token rotates on use, a second concurrent call would find the
// first token already revoked and trigger reuse-detection, logging the
// user out unnecessarily. All callers share one in-flight refresh promise.
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  const session = getSession();
  if (!session) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: session.refreshToken }),
        });
        if (!res.ok) {
          clearSession();
          return false;
        }
        const data = await res.json();
        saveSession({ ...session, accessToken: data.accessToken, refreshToken: data.refreshToken });
        return true;
      } catch {
        return false;
      } finally {
        // Reset after this tick so a later 401 can trigger a fresh refresh.
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(
  path: string,
  init: RequestInit,
  token: string | undefined,
  allowRefresh = true
): Promise<{ status: number; data: T }> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));

  // If the access token expired mid-session, refresh once and retry the
  // same request transparently — the caller never sees the intermediate
  // 401. Only attempted when a token was actually supplied (skips this
  // entirely for public endpoints like /auth/login or /contact).
  if (res.status === 401 && token && allowRefresh && (data as { error?: string })?.error === "invalid_or_expired_token") {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      const session = getSession();
      return request<T>(path, init, session?.accessToken, false);
    }
  }

  return { status: res.status, data };
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<{ status: number; data: T }> {
  return request<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, token);
}

export async function apiGet<T>(path: string, token?: string): Promise<{ status: number; data: T }> {
  return request<T>(path, { method: "GET" }, token);
}

export async function apiPut<T>(path: string, body: unknown, token?: string): Promise<{ status: number; data: T }> {
  return request<T>(path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, token);
}

// Signup funnel state (pre-login) is tracked separately since there's no
// access token yet until after payment-method is added.
const SIGNUP_KEY = "abegdrive_signup";

export interface SignupState {
  userId: string;
  phone: string;
}

export function saveSignupState(state: SignupState) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(SIGNUP_KEY, JSON.stringify(state));
  }
}

export function getSignupState(): SignupState | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SIGNUP_KEY);
  return raw ? JSON.parse(raw) : null;
}
