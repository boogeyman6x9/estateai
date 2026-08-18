"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { propertySchema } from "@/lib/validation/property";
import { requireAgencyContext } from "@/lib/dashboard-context";
import type { ActionResult } from "./auth";

export async function createPropertyAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { agency } = await requireAgencyContext();

  const parsed = propertySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    property_type: formData.get("property_type"),
    listing_type: formData.get("listing_type"),
    status: formData.get("status") || "draft",
    price: formData.get("price") || undefined,
    bedrooms: formData.get("bedrooms") || undefined,
    bathrooms: formData.get("bathrooms") || undefined,
    parking_spaces: formData.get("parking_spaces") || undefined,
    address: formData.get("address"),
    suburb: formData.get("suburb"),
    state: formData.get("state") || undefined,
    postcode: formData.get("postcode") || undefined,
    features: (formData.get("features") as string | null)
      ?.split(",")
      .map((f) => f.trim())
      .filter(Boolean) ?? [],
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const priceDisplay =
    parsed.data.price != null
      ? parsed.data.listing_type === "rent"
        ? `$${parsed.data.price}/week`
        : `$${parsed.data.price.toLocaleString()}`
      : undefined;

  const { error } = await supabase.from("properties").insert({
    agency_id: agency.id,
    ...parsed.data,
    price_display: priceDisplay,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/properties");
  return { success: true };
}

export async function deletePropertyAction(propertyId: string) {
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();
  await supabase
    .from("properties")
    .update({ status: "withdrawn" })
    .eq("id", propertyId)
    .eq("agency_id", agency.id);
  revalidatePath("/dashboard/properties");
}
