import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { phoneNumber } from "better-auth/plugins";

import { getServerEnv } from "@eshanika/env/server";
import { createTwoFactorProvider } from "@eshanika/messaging";
import { getDb } from "@eshanika/db";
import { otpSchema, phoneNumberSchema } from "@eshanika/validation";

function required(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function trustedOrigins(value: string | undefined) {
  return value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createAuth() {
  const env = getServerEnv();
  const database = getDb();
  const sms = env.TWOFACTOR_API_KEY
    ? createTwoFactorProvider({
        apiKey: env.TWOFACTOR_API_KEY,
        templateName: required(
          env.TWOFACTOR_OTP_TEMPLATE_NAME,
          "TWOFACTOR_OTP_TEMPLATE_NAME",
        ),
        senderId: env.TWOFACTOR_SENDER_ID,
      })
    : undefined;
  const origins = trustedOrigins(env.BETTER_AUTH_TRUSTED_ORIGINS);

  return betterAuth({
    database: drizzleAdapter(database.db, { provider: "pg" }),
    secret: required(env.BETTER_AUTH_SECRET, "BETTER_AUTH_SECRET"),
    ...(env.BETTER_AUTH_URL || env.APP_URL
      ? { baseURL: env.BETTER_AUTH_URL ?? env.APP_URL }
      : {}),
    ...(origins && origins.length > 0 ? { trustedOrigins: origins } : {}),
    plugins: [
      phoneNumber({
        allowedAttempts: 3,
        phoneNumberValidator: (phone) =>
          phoneNumberSchema.safeParse(phone).success,
        sendOTP: async ({ phoneNumber: phone, code }) => {
          if (!sms) {
            throw new Error("TWOFACTOR_API_KEY is required for phone OTP");
          }

          await sms.sendOtp({
            phoneNumber: phoneNumberSchema.parse(phone),
            code: otpSchema.parse(code),
          });
        },
        signUpOnVerification: {
          getTempEmail: (phone) =>
            `${phone.replace(/\D/g, "")}@phone.eshanika.local`,
          getTempName: () => "Eshanika customer",
        },
      }),
    ],
  });
}

let auth: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  auth ??= createAuth();
  return auth;
}

export type Auth = ReturnType<typeof createAuth>;
