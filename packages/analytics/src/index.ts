export const analyticsEvents = [
  "page_view",
  "product_view",
  "add_to_cart",
  "begin_checkout",
  "purchase",
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];
