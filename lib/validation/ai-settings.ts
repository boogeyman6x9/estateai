import { z } from "zod";

export const aiSettingsSchema = z.object({
  enabled: z.boolean(),
  assistant_name: z.string().min(1, "Give your assistant a name"),
  personality: z.enum(["professional", "friendly", "premium", "casual"]),
  greeting: z.string().min(1, "Write a greeting message"),
  qualification_enabled: z.boolean(),
  lead_scoring_enabled: z.boolean(),
  follow_up_enabled: z.boolean(),
  booking_enabled: z.boolean(),
  custom_instructions: z.string().max(2000).optional(),
});
export type AiSettingsInput = z.infer<typeof aiSettingsSchema>;
