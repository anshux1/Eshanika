import {
  otpSchema,
  phoneNumberSchema,
  twoFactorResponseSchema,
} from "@eshanika/validation";

import type { OtpInput, SmsProvider } from "./provider.ts";

const TWOFACTOR_SEND_URL = "https://2factor.in/API/V1/OTP/SEND";

export interface TwoFactorConfig {
  readonly apiKey: string;
  readonly templateName?: string;
  readonly senderId?: string;
  readonly timeoutMs?: number;
}

export function createTwoFactorProvider(
  config: TwoFactorConfig,
  fetcher: typeof fetch = fetch,
): SmsProvider {
  if (!config.apiKey) {
    throw new Error("TWOFACTOR_API_KEY is required");
  }

  return {
    async sendOtp(input: OtpInput) {
      const phoneNumber = phoneNumberSchema.parse(input.phoneNumber);
      const code = otpSchema.parse(input.code);
      const timeoutSignal = AbortSignal.timeout(config.timeoutMs ?? 10_000);
      const signal = input.signal
        ? AbortSignal.any([input.signal, timeoutSignal])
        : timeoutSignal;

      const response = await fetcher(TWOFACTOR_SEND_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": config.apiKey,
        },
        body: JSON.stringify({
          to: phoneNumber,
          template_name: input.templateName ?? config.templateName,
          ...(config.senderId ? { sender_id: config.senderId } : {}),
          var1: code,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error("2Factor rejected the OTP request");
      }

      const result = twoFactorResponseSchema.safeParse(await response.json());
      const status = result.success
        ? (result.data.Status ?? result.data.status)?.toLowerCase()
        : undefined;

      if (!result.success || (status !== "success" && status !== "sent")) {
        throw new Error("2Factor rejected the OTP request");
      }

      return {
        ...(typeof (result.data.Details ?? result.data.session_id) === "string"
          ? { messageId: result.data.Details ?? result.data.session_id }
          : {}),
      };
    },
  };
}
