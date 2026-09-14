export interface OtpInput {
  readonly phoneNumber: string;
  readonly code: string;
  readonly templateName?: string;
  readonly signal?: AbortSignal;
}

export interface SmsProvider {
  sendOtp(input: OtpInput): Promise<{ readonly messageId?: string }>;
}
