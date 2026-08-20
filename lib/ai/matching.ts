import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { PropertyContext, PropertyMatchCriteria } from "./types";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];

export function toPropertyContext(row: PropertyRow): PropertyContext {
  return {
    id: row.id,
    title: row.title,
    propertyType: row.property_type,
    listingType: row.listing_type,
    priceDisplay: row.price_display,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    parkingSpaces: row.parking_spaces,
    suburb: row.suburb,
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    description: row.description,
    inspectionInformation: row.inspection_information,
  };
}

/**
 * Searches only the agency's own active listings — the AI layer is never
 * allowed to answer "similar properties" questions from anything but this
 * function's output (spec section 15: "Do not allow the AI to invent
 * property details").
 */
export async function findMatchingProperties(
  supabase: SupabaseClient<Database>,
  agencyId: string,
  criteria: PropertyMatchCriteria,
  limit = 5
): Promise<PropertyContext[]> {
  let query = supabase
    .from("properties")
    .select("*")
    .eq("agency_id", agencyId)
    .eq("status", "active");

  if (criteria.listingType) query = query.eq("listing_type", criteria.listingType);
  if (criteria.propertyType) {
    query = query.eq(
      "property_type",
      criteria.propertyType as PropertyContext["propertyType"] as never
    );
  }
  if (criteria.budgetMax) query = query.lte("price", criteria.budgetMax);
  if (criteria.budgetMin) query = query.gte("price", criteria.budgetMin);
  if (criteria.bedrooms) query = query.gte("bedrooms", criteria.bedrooms);
  if (criteria.bathrooms) query = query.gte("bathrooms", criteria.bathrooms);
  if (criteria.suburbs && criteria.suburbs.length > 0) {
    query = query.in("suburb", criteria.suburbs);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);

  if (error) throw error;
  return (data ?? []).map(toPropertyContext);
}

/**
 * Fetches a single property by id, scoped to the agency — used to ground the
 * AI's answers when a lead asks about a specific listing.
 */
export async function getPropertyContext(
  supabase: SupabaseClient<Database>,
  agencyId: string,
  propertyId: string
): Promise<PropertyContext | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("agency_id", agencyId)
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw error;
  return data ? toPropertyContext(data) : null;
}
