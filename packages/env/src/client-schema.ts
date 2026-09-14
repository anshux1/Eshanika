import { z } from "zod";

const optionalText = z.string().trim().min(1).optional();
const optionalUrl = z.string().url().optional();

export const clientEnvSchema = {
  NEXT_PUBLIC_APP_URL: optionalUrl,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: optionalText,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalText,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optionalText,
} as const;

export type ClientEnv = {
  [Key in keyof typeof clientEnvSchema]: z.infer<(typeof clientEnvSchema)[Key]>;
};
