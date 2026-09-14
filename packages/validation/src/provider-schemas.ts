import { z } from "zod";

export const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone number must use E.164 format");

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must be six digits");

export const twoFactorResponseSchema = z
  .object({
    Status: z.string().optional(),
    Details: z.string().optional(),
    status: z.string().optional(),
    session_id: z.string().optional(),
  })
  .passthrough();

export const razorpayWebhookSchema = z
  .object({ event: z.string().min(1) })
  .passthrough();
