import { z } from "zod";

export const followUpChannelEnum = z.enum([
  "website", "sms", "whatsapp", "email", "phone", "manual",
]);

export const scheduleFollowUpSchema = z.object({
  scheduled_for: z
    .string()
    .min(1, "Pick a date and time")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date"),
  channel: followUpChannelEnum.default("website"),
  message: z.string().trim().min(1, "Write a message").max(2000, "Message is too long"),
});
export type ScheduleFollowUpInput = z.infer<typeof scheduleFollowUpSchema>;
