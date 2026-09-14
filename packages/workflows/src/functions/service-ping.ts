import { inngest } from "../client.ts";
import { workflowEvents } from "../events.ts";

export const servicePing = inngest.createFunction(
  {
    id: "service-ping",
    retries: 2,
    triggers: [workflowEvents.setupPing],
  },
  async ({ event, step }) => {
    const checkedAt = await step.run("record-ping", () =>
      new Date().toISOString(),
    );

    return {
      requestId: event.data.requestId,
      checkedAt,
    };
  },
);
