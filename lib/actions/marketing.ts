"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { hasProFeatures } from "@/lib/subscription";
import { generateMarketingAsset, toPropertyContext, type MarketingAssetType } from "@/lib/ai";

export type MarketingAssetResult = { content: string } | { error: string };

/**
 * Powers "Generate Marketing" on the property page (spec section 23). Never
 * persists anything — each call is fresh, and the UI owns copy/export only.
 * Professional+ only — checked here too, not just hidden in the UI, since
 * this is a real cost (an AI call) an unpaid trial shouldn't be able to run.
 */
export async function generateMarketingAssetAction(
  propertyId: string,
  assetType: MarketingAssetType
): Promise<MarketingAssetResult> {
  const { agency } = await requireAgencyContext();
  if (!hasProFeatures(agency)) {
    return { error: "Upgrade to Professional to unlock AI marketing content." };
  }
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("agency_id", agency.id)
    .maybeSingle();
  if (!property) return { error: "Property not found" };

  try {
    const content = await generateMarketingAsset(toPropertyContext(property), assetType);
    return { content };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate content" };
  }
}
