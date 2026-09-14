import { serve } from "inngest/next";

import { functions, inngest } from "@eshanika/workflows";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
