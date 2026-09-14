import "server-only";

import { Resend } from "resend";

import { getServerEnv } from "@eshanika/env/server";

export function createEmailClient(apiKey = getServerEnv().RESEND_API_KEY) {
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required");
  }

  return new Resend(apiKey);
}
