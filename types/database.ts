// Mirrors supabase/migrations/*.sql. Once you have a live Supabase project, prefer
// regenerating this file with:
//   npx supabase gen types typescript --project-id <your-project-ref> > types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          address: string | null;
          timezone: string;
          subscription_plan: "starter" | "professional" | "enterprise";
          subscription_status: "trialing" | "active" | "past_due" | "canceled";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["agencies"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["agencies"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          agency_id: string | null;
          full_name: string | null;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          role: "owner" | "agent" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      agents: {
        Row: {
          id: string;
          agency_id: string;
          profile_id: string;
          title: string | null;
          bio: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["agents"]["Row"]> & {
          agency_id: string;
          profile_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["agents"]["Row"]>;
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          agency_id: string;
          agent_id: string | null;
          title: string;
          description: string | null;
          property_type:
            | "house"
            | "apartment"
            | "townhouse"
            | "villa"
            | "land"
            | "commercial"
            | "other";
          listing_type: "sale" | "rent";
          status: "draft" | "active" | "under_offer" | "sold" | "leased" | "withdrawn";
          price: number | null;
          price_display: string | null;
          bedrooms: number | null;
          bathrooms: number | null;
          parking_spaces: number | null;
          address: string;
          suburb: string;
          state: string | null;
          postcode: string | null;
          latitude: number | null;
          longitude: number | null;
          features: Json;
          images: Json;
          inspection_information: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["properties"]["Row"]> & {
          agency_id: string;
          title: string;
          address: string;
          suburb: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Row"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          agency_id: string;
          assigned_agent_id: string | null;
          property_id: string | null;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          lead_type: "buyer" | "renter" | "investor" | "seller" | "landlord" | "general";
          budget_min: number | null;
          budget_max: number | null;
          preferred_suburbs: Json;
          preferred_property_types: Json;
          bedrooms_required: number | null;
          bathrooms_required: number | null;
          parking_required: number | null;
          finance_status: "unknown" | "not_started" | "in_progress" | "pre_approved" | "cash_buyer";
          purchase_timeline: string | null;
          purpose: "owner_occupier" | "investment" | "unknown";
          lead_score: number;
          lead_temperature: "hot" | "warm" | "cold";
          status:
            | "new"
            | "contacted"
            | "qualified"
            | "inspection_booked"
            | "negotiating"
            | "converted"
            | "lost"
            | "archived";
          source: string;
          last_contacted_at: string | null;
          next_follow_up_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["leads"]["Row"]> & {
          agency_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Row"]>;
        Relationships: [];
      };
      lead_score_history: {
        Row: {
          id: string;
          lead_id: string;
          agency_id: string;
          score: number;
          temperature: "hot" | "warm" | "cold";
          reason: string | null;
          factors: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["lead_score_history"]["Row"]> & {
          lead_id: string;
          agency_id: string;
          score: number;
          temperature: "hot" | "warm" | "cold";
        };
        Update: Partial<Database["public"]["Tables"]["lead_score_history"]["Row"]>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          agency_id: string;
          lead_id: string;
          property_id: string | null;
          channel: "website" | "sms" | "whatsapp" | "email" | "phone" | "manual";
          status: "active" | "paused" | "closed";
          ai_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["conversations"]["Row"]> & {
          agency_id: string;
          lead_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Row"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          agency_id: string;
          sender_type: "lead" | "ai" | "agent" | "system";
          sender_id: string | null;
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["messages"]["Row"]> & {
          conversation_id: string;
          agency_id: string;
          sender_type: "lead" | "ai" | "agent" | "system";
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          agency_id: string;
          lead_id: string;
          property_id: string | null;
          agent_id: string | null;
          appointment_type: "inspection" | "call" | "meeting" | "other";
          scheduled_at: string;
          status: "requested" | "confirmed" | "completed" | "cancelled" | "no_show";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["appointments"]["Row"]> & {
          agency_id: string;
          lead_id: string;
          scheduled_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Row"]>;
        Relationships: [];
      };
      follow_ups: {
        Row: {
          id: string;
          agency_id: string;
          lead_id: string;
          conversation_id: string | null;
          scheduled_for: string;
          channel: "website" | "sms" | "whatsapp" | "email" | "phone" | "manual";
          message: string;
          status: "scheduled" | "sent" | "cancelled" | "failed";
          attempts: number;
          executed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["follow_ups"]["Row"]> & {
          agency_id: string;
          lead_id: string;
          scheduled_for: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["follow_ups"]["Row"]>;
        Relationships: [];
      };
      ai_settings: {
        Row: {
          id: string;
          agency_id: string;
          enabled: boolean;
          assistant_name: string;
          personality: string;
          greeting: string;
          qualification_enabled: boolean;
          lead_scoring_enabled: boolean;
          follow_up_enabled: boolean;
          booking_enabled: boolean;
          custom_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ai_settings"]["Row"]> & {
          agency_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_settings"]["Row"]>;
        Relationships: [];
      };
      lead_events: {
        Row: {
          id: string;
          agency_id: string;
          lead_id: string;
          event_type:
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
          actor_type: "lead" | "ai" | "agent" | "system";
          actor_id: string | null;
          data: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["lead_events"]["Row"]> & {
          agency_id: string;
          lead_id: string;
          event_type: Database["public"]["Tables"]["lead_events"]["Row"]["event_type"];
        };
        Update: Partial<Database["public"]["Tables"]["lead_events"]["Row"]>;
        Relationships: [];
      };
      rate_limit_counters: {
        Row: { bucket_key: string; window_start: string; count: number };
        Insert: Partial<Database["public"]["Tables"]["rate_limit_counters"]["Row"]> & {
          bucket_key: string;
        };
        Update: Partial<Database["public"]["Tables"]["rate_limit_counters"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_agency_for_current_user: {
        Args: { agency_name: string; agency_slug: string };
        Returns: Database["public"]["Tables"]["agencies"]["Row"];
      };
      attach_invited_agent: {
        Args: { invited_profile_id: string; agent_title?: string | null };
        Returns: Database["public"]["Tables"]["agents"]["Row"];
      };
      check_rate_limit: {
        Args: { p_key: string; p_window_seconds: number; p_max_requests: number };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}
