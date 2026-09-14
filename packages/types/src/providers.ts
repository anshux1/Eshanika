export type ProviderName =
  | "neon"
  | "better-auth"
  | "2factor"
  | "resend"
  | "cloudflare-r2"
  | "razorpay"
  | "inngest"
  | "turnstile"
  | "analytics";

export type ProviderHealthStatus = "healthy" | "unhealthy";

export interface ProviderHealth {
  readonly provider: ProviderName;
  readonly status: ProviderHealthStatus;
  readonly checkedAt: string;
}
