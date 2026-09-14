import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import { rpcClient } from "./client.ts";

export const orpc = createTanstackQueryUtils(rpcClient);
