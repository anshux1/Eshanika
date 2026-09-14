# Initial WAF and rate-limit rules

Start in staging with narrow rules:

- rate-limit OTP requests, login, and account recovery;
- rate-limit anonymous search and contact endpoints;
- protect admin paths;
- block clearly malicious traffic;
- allow signed Razorpay and Inngest callbacks through without browser
  challenges.

Review false positives in Cloudflare events before enabling the same rules in
production. Application code still validates Better Auth sessions, Turnstile
tokens, and provider signatures.
