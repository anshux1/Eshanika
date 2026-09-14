import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export function signRequestBody(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifyRequestSignature(
  body: string,
  signature: string,
  secret: string,
) {
  const expected = Buffer.from(signRequestBody(body, secret));
  const received = Buffer.from(signature);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
