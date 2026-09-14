import "server-only";

import { getAuth } from "./auth.ts";

export { getAuth } from "./auth.ts";
export type { Auth } from "./auth.ts";

export function getSession(requestHeaders: Headers) {
  return getAuth().api.getSession({ headers: requestHeaders });
}

export async function requireAuthenticatedUser(requestHeaders: Headers) {
  const session = await getSession(requestHeaders);

  if (!session) {
    throw new Error("Authentication required");
  }

  return session.user;
}
