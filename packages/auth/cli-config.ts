import { betterAuth } from "better-auth/minimal";
import { phoneNumber } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    phoneNumber({
      sendOTP: async () => undefined,
    }),
  ],
});
