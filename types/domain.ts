// Domain types mirroring supabase/migrations. Keep in sync with the SQL enums —
// see supabase/migrations/0001_init_schema.sql for the source of truth.

export type UserRole = "owner" | "agent" | "admin";

export type PropertyStatus =
  | "draft"
  | "active"
  | "under_offer"
  | "sold"
  | "leased"
  | "withdrawn";

export type ListingType = "sale" | "rent";

export type PropertyType =
  | "house"
  | "apartment"
  | "townhouse"
  | "villa"
  | "land"
  | "commercial"
  | "other";

export type LeadType =
  | "buyer"
  | "renter"
  | "investor"
  | "seller"
  | "landlord"
  | "general";

export type LeadTemperature = "hot" | "warm" | "cold";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "inspection_booked"
  | "negotiating"
  | "converted"
  | "lost"
  | "archived";

export type ConversationChannel =
  | "website"
  | "sms"
  | "whatsapp"
  | "email"
  | "phone"
  | "manual";

export type ConversationStatus = "active" | "paused" | "closed";

export type SenderType = "lead" | "ai" | "agent" | "system";

export type AppointmentType = "inspection" | "call" | "meeting" | "other";

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type FollowUpStatus = "scheduled" | "sent" | "cancelled" | "failed";

export type FinanceStatus =
  | "unknown"
  | "not_started"
  | "in_progress"
  | "pre_approved"
  | "cash_buyer";

export type LeadPurpose = "owner_occupier" | "investment" | "unknown";

export type SubscriptionPlan = "starter" | "professional" | "enterprise";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export type LeadEventType =
  | "lead_created"
  | "message_received"
  | "ai_response"
  | "lead_scored"
  | "lead_qualified"
  | "inspection_requested"
  | "inspection_booked"
  | "agent_assigned"
  | "follow_up_scheduled"
  | "follow_up_sent"
  | "lead_converted"
  | "status_changed"
  | "note_added";

export const LEAD_TEMPERATURE_LABEL: Record<LeadTemperature, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  inspection_booked: "Inspection booked",
  negotiating: "Negotiating",
  converted: "Converted",
  lost: "Lost",
  archived: "Archived",
};

export function scoreToTemperature(score: number): LeadTemperature {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}
