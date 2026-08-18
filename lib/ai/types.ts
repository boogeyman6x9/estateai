import type {
  FinanceStatus,
  LeadPurpose,
  LeadTemperature,
  LeadType,
} from "@/types/domain";

export interface AgencyContext {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface AiSettingsContext {
  assistantName: string;
  personality: "professional" | "friendly" | "premium" | "casual";
  greeting: string;
  qualificationEnabled: boolean;
  bookingEnabled: boolean;
  customInstructions: string | null;
}

export interface PropertyContext {
  id: string;
  title: string;
  propertyType: string;
  listingType: "sale" | "rent";
  priceDisplay: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  suburb: string;
  features: string[];
  description: string | null;
  inspectionInformation: string | null;
}

export interface ConversationMessage {
  role: "lead" | "ai" | "agent" | "system";
  content: string;
}

export interface LeadContext {
  firstName: string | null;
  leadType: LeadType | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredSuburbs: string[];
  bedroomsRequired: number | null;
  financeStatus: FinanceStatus | null;
  purchaseTimeline: string | null;
  purpose: LeadPurpose | null;
}

export interface GenerateReplyInput {
  agency: AgencyContext;
  aiSettings: AiSettingsContext;
  property: PropertyContext | null;
  matchingProperties: PropertyContext[];
  lead: LeadContext;
  history: ConversationMessage[];
}

export interface GenerateReplyResult {
  reply: string;
  shouldEscalateToAgent: boolean;
}

export interface QualificationExtraction {
  leadType: LeadType | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredSuburbs: string[];
  bedroomsRequired: number | null;
  financeStatus: FinanceStatus | null;
  purchaseTimeline: string | null;
  purpose: LeadPurpose | null;
  wantsInspection: boolean;
}

export interface ScoringFactors {
  purchaseIntent: boolean;
  financePreApproved: boolean;
  inspectionRequested: boolean;
  budgetProvided: boolean;
  timelineUnder30Days: boolean;
  respondingActively: boolean;
  propertyMatch: boolean;
}

export interface ScoringResult {
  score: number;
  temperature: LeadTemperature;
  factors: ScoringFactors;
}

export interface PropertyMatchCriteria {
  budgetMax?: number | null;
  budgetMin?: number | null;
  suburbs?: string[];
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertyType?: string | null;
  listingType?: "sale" | "rent" | null;
  features?: string[];
}

export interface ConversationSummary {
  headline: string;
  summary: string;
}

export type MarketingAssetType =
  | "listing_description"
  | "short_listing_description"
  | "instagram_caption"
  | "facebook_post"
  | "email_campaign"
  | "sms_announcement"
  | "open_home_reminder";
