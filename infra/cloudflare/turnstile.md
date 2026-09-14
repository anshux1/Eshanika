# Turnstile checklist

Create separate widgets for staging and production and allow only the matching
hostnames. Send the browser token to the server and call
`packages/security`'s `verifyTurnstileToken` before accepting an abuse-sensitive
request.

Use it for OTP/login, account recovery, contact, and other anonymous forms. Do
not require it on Razorpay or Inngest callbacks; those endpoints use their own
signature or platform verification.
