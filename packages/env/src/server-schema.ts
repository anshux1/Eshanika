import { z } from "zod";

const emptyAsUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalText = z.preprocess(
  emptyAsUndefined,
  z.string().trim().min(1).optional(),
);
const optionalUrl = z.preprocess(emptyAsUndefined, z.string().url().optional());
const optionalEmail = z.preprocess(
  emptyAsUndefined,
  z.string().email().optional(),
);

export const serverEnvSchema = {
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_ENV: z
    .enum(["development", "test", "staging", "production"])
    .default("development"),
  APP_URL: optionalUrl,
  BETTER_AUTH_SECRET: optionalText,
  BETTER_AUTH_URL: optionalUrl,
  BETTER_AUTH_TRUSTED_ORIGINS: optionalText,
  DATABASE_URL: optionalText,
  DATABASE_URL_UNPOOLED: optionalText,
  NEON_PROJECT_ID: optionalText,
  TWOFACTOR_API_KEY: optionalText,
  TWOFACTOR_OTP_TEMPLATE_NAME: optionalText,
  TWOFACTOR_SENDER_ID: optionalText,
  RESEND_API_KEY: optionalText,
  RESEND_FROM_EMAIL: optionalEmail,
  RESEND_REPLY_TO: optionalEmail,
  R2_ACCOUNT_ID: optionalText,
  R2_ACCESS_KEY_ID: optionalText,
  R2_SECRET_ACCESS_KEY: optionalText,
  R2_PUBLIC_BUCKET: optionalText,
  R2_PRIVATE_BUCKET: optionalText,
  R2_PUBLIC_BASE_URL: optionalUrl,
  RAZORPAY_KEY_ID: optionalText,
  RAZORPAY_KEY_SECRET: optionalText,
  RAZORPAY_WEBHOOK_SECRET: optionalText,
  INNGEST_APP_ID: optionalText,
  INNGEST_EVENT_KEY: optionalText,
  INNGEST_SIGNING_KEY: optionalText,
  INNGEST_DEV: optionalText,
  INNGEST_BASE_URL: optionalUrl,
  TURNSTILE_SECRET_KEY: optionalText,
  CLOUDFLARE_ACCOUNT_ID: optionalText,
  CLOUDFLARE_ZONE_ID: optionalText,
} as const;

export type ServerEnv = {
  [Key in keyof typeof serverEnvSchema]: z.infer<(typeof serverEnvSchema)[Key]>;
};

const parsedServerEnvSchema = z.object(serverEnvSchema);

export function getServerEnv(): ServerEnv {
  return parsedServerEnvSchema.parse(process.env) as ServerEnv;
}
