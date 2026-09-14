import type { Resend } from "resend";

export interface EmailInput {
  readonly from: string;
  readonly to: string | string[];
  readonly subject: string;
  readonly html: string;
  readonly replyTo?: string;
  readonly idempotencyKey?: string;
}

export async function sendEmail(client: Resend, input: EmailInput) {
  const result = await client.emails.send(
    {
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    },
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data?.id) {
    throw new Error("Resend did not return a message id");
  }

  return result.data.id;
}
