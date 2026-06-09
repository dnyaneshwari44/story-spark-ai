/**
 * auth.service.ts
 *
 * Handles all authentication API calls: OTP send/verify, Google OAuth,
 * logout, and current-user fetch.
 *
 * FIX #4  — Replaced every raw "http://localhost:5000" with API_V1.
 * FIX #8  — Uses centralised API_BASE guard from api.config.ts.
 * Added   — Friendly error messages for "Failed to fetch" (backend down).
 * Added   — submit button re-enable pattern via thrown errors with messages.
 */

import { API_V1 } from "../config/api.config";

// ─── Types ───

export interface SendOtpPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    subscriptionType: "free" | "premium";
  };
  message?: string;
}

// ── Helper ──

/**
 * Thin fetch wrapper that:
 * 1. Attaches JSON headers and auth token automatically.
 * 2. Converts "Failed to fetch" into a human-readable message.
 * 3. Throws on non-2xx responses with the server's error message.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  let response: Response;

  try {
    response = await fetch(`${API_V1}${endpoint}`, { ...options, headers });
  } catch {
    // Network error — backend is down or VITE_BASE_URL is wrong
    throw new Error(
      "Unable to connect to the server. Please check your internet connection or try again later."
    );
  }

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      errorMessage = body?.message ?? body?.error ?? errorMessage;
    } catch {
      // response body wasn't JSON — use the default message
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

// ─── Auth API calls ───

/**
 * Send OTP to the given email address.
 * Backend: POST /api/v1/auth/send-otp
 */
export async function sendOtp(payload: SendOtpPayload): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Verify OTP and complete login / registration.
 * Backend: POST /api/v1/auth/verify-otp
 * On success, stores the JWT in localStorage.
 */
export async function verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

/**
 * Exchange a Google ID token for a backend JWT.
 * Backend: POST /api/v1/auth/google
 */
export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

/**
 * Fetch the currently authenticated user's profile.
 * Backend: GET /api/v1/auth/me
 */
export async function getCurrentUser(): Promise<AuthResponse["user"]> {
  const data = await apiFetch<{ user: AuthResponse["user"] }>("/auth/me");
  return data.user;
}

/**
 * Log the user out — clears the local token.
 * Backend: POST /api/v1/auth/logout (optional — mainly clears local state)
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", { method: "POST" });
  } finally {
    // Always clear local token even if the server call fails
    localStorage.removeItem("token");
  }
}
