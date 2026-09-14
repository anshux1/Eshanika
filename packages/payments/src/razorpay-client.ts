import "server-only";

import Razorpay from "razorpay";

import { getServerEnv } from "@eshanika/env/server";

export function createRazorpayClient() {
  const env = getServerEnv();
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are required");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export interface PaymentOrderInput {
  /** Amount calculated by trusted server-side commerce logic, in paise. */
  readonly amountInPaise: number;
  readonly currency?: string;
  readonly receipt?: string;
  readonly notes?: Record<string, string>;
}

export function createPaymentOrder(
  input: PaymentOrderInput,
  client = createRazorpayClient(),
) {
  if (!Number.isSafeInteger(input.amountInPaise) || input.amountInPaise <= 0) {
    throw new Error("Payment amount must be a positive integer in paise");
  }

  return client.orders.create({
    amount: input.amountInPaise,
    currency: input.currency ?? "INR",
    ...(input.receipt ? { receipt: input.receipt } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  });
}
