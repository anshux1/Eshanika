# Cloudflare

Use Cloudflare for DNS, R2, Turnstile, and edge protection.

- Create separate public/private R2 buckets for staging and production.
- Give the R2 token only the bucket permissions required by the app.
- Keep R2 credentials server-only; browser uploads use Better Upload's
  short-lived pre-signed URLs.
- Create separate Turnstile widgets for staging and production.
- Do not put a browser challenge on Razorpay or Inngest callbacks; those routes
  validate provider signatures instead.
- Start WAF and rate-limit rules narrowly on OTP, login, public API, and admin
  paths, then verify them on staging before production.
