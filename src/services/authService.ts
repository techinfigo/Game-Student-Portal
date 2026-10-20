/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebase";

const WEBSITE_API_URL =
  import.meta.env.VITE_WEBSITE_API_URL || "https://www.gameacademy.in";

export interface VerifyOtpResult {
  token: string;
  isNewUser: boolean;
  uid: string;
  phone: string;
  name?: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${WEBSITE_API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || data?.error || "Something went wrong. Please try again.");
  }

  return data as T;
}

export async function sendOtp(phone: string): Promise<void> {
  await postJson<{ success: boolean }>("/api/auth/send-otp", { phone });
}

export async function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResult> {
  const result = await postJson<VerifyOtpResult>("/api/auth/verify-otp", { phone, otp });
  await signInWithCustomToken(auth, result.token);
  return result;
}

/**
 * Signs a student in with a Firebase custom token handed over by the website
 * (the `?sso=` hand-off). Throws if the token is invalid or expired.
 */
export async function signInWithSsoToken(token: string): Promise<void> {
  await signInWithCustomToken(auth, token);
}
