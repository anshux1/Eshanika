import "server-only";

import { Inngest } from "inngest";

import { getServerEnv } from "@eshanika/env/server";

const env = getServerEnv();

export const inngest = new Inngest({
  id: env.INNGEST_APP_ID ?? "eshanika-store",
  eventKey: env.INNGEST_EVENT_KEY,
  signingKey: env.INNGEST_SIGNING_KEY,
  baseUrl: env.INNGEST_BASE_URL,
});
