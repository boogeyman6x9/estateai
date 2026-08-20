import { z } from "zod";

export const leadTypeEnum = z.enum([
  "buyer", "renter", "investor", "seller", "landlord", "general",
]);
export const leadStatusEnum = z.enum([
  "new", "contacted", "qualified", "inspection_booked",
  "negotiating", "converted", "lost", "archived",
]);
export const financeStatusEnum = z.enum([
  "unknown", "not_started", "in_progress", "pre_approved", "cash_buyer",
]);
export const leadPurposeEnum = z.enum(["owner_occupier", "investment", "unknown"]);

export const leadSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  lead_type: leadTypeEnum.default("general"),
  property_id: z.string().uuid().optional().nullable(),
  assigned_agent_id: z.string().uuid().optional().nullable(),
  budget_min: z.coerce.number().nonnegative().optional(),
  budget_max: z.coerce.number().nonnegative().optional(),
  preferred_suburbs: z.array(z.string()).default([]),
  bedrooms_required: z.coerce.number().int().min(0).optional(),
  finance_status: financeStatusEnum.default("unknown"),
  purchase_timeline: z.string().optional(),
  purpose: leadPurposeEnum.default("unknown"),
  source: z.string().default("manual"),
});
export type LeadInput = z.infer<typeof leadSchema>;

export const updateLeadStatusSchema = z.object({
  leadId: z.string().uuid(),
  status: leadStatusEnum,
});
