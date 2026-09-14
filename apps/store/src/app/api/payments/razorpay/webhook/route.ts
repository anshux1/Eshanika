import { getServerEnv } from "@eshanika/env/server";
import { parseWebhookEvent, verifyWebhookSignature } from "@eshanika/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = getServerEnv().RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");
  const body = await request.text();

  if (!secret) {
    return Response.json(
      { error: "Webhook is not configured" },
      { status: 503 },
    );
  }

  if (!signature || !verifyWebhookSignature(body, signature, secret)) {
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  try {
    const event = parseWebhookEvent(JSON.parse(body));

    // State changes belong to the commerce application layer.
    return Response.json({ received: true, event: event.event });
  } catch {
    return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
