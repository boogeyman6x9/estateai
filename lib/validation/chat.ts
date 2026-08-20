import { z } from "zod";

export const chatRequestSchema = z.object({
  agencyId: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional(),
  message: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message is too long"),
  lead: z
    .object({
      firstName: z.string().trim().min(1).max(100).optional(),
      email: z.string().email().optional(),
      phone: z.string().trim().min(3).max(30).optional(),
    })
    .optional(),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;
