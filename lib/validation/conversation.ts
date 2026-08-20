import { z } from "zod";

export const sendLeadMessageSchema = z.object({
  lead_id: z.string().uuid(),
  content: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message is too long"),
});
