"use client";

import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [phoneNumberClient()],
});

export const { signOut, useSession } = authClient;

export function requestPhoneOtp(phoneNumber: string) {
  return authClient.phoneNumber.sendOtp({ phoneNumber });
}

export function verifyPhoneOtp(phoneNumber: string, code: string) {
  return authClient.phoneNumber.verify({ phoneNumber, code });
}
