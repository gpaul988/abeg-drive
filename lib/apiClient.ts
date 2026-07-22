"use client";

const API_BASE = "/api/v1";

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<{ status: number; data: T }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

export async function apiGet<T>(path: string, token?: string): Promise<{ status: number; data: T }> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

export async function apiPut<T>(path: string, body: unknown, token?: string): Promise<{ status: number; data: T }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const SESSION_KEY = "safekeys_session";

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

// Signup funnel state (pre-login) is tracked separately since there's no
// access token yet until after payment-method is added.
const SIGNUP_KEY = "safekeys_signup";

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
