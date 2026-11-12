import { z } from "zod";

export const owebNativeSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export const owebSsoRedeemSchema = z.object({
  launchToken: z.string().trim().min(1),
});
