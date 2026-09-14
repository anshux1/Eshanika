import { eventType } from "inngest";
import { z } from "zod";

const setupPing = eventType("setup/ping", {
  schema: z.object({ requestId: z.string().min(1) }),
});

export const workflowEvents = {
  setupPing,
} as const;
