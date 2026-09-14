import { razorpayWebhookSchema } from "@eshanika/validation";

export function parseWebhookEvent(value: unknown) {
  const parsed = razorpayWebhookSchema.safeParse(value);

  if (!parsed.success) {
    throw new Error("Invalid Razorpay webhook payload");
  }

  return {
    event: parsed.data.event,
    payload: parsed.data,
  };
}

export function paymentEventIdempotencyKey(event: string, eventId: string) {
  return `razorpay:${event}:${eventId}`;
}
