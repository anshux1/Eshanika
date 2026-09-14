import "server-only";

import { getServerEnv } from "@eshanika/env/server";

export async function verifyTurnstileToken(
  token: string,
  secret = getServerEnv().TURNSTILE_SECRET_KEY,
) {
  if (!token || !secret) {
    return false;
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    },
  );

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as { success?: unknown };
  return result.success === true;
}
