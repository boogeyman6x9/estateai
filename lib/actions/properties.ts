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
  const { error } = await supabase
    .from("properties")
    .update({ status: "withdrawn" })
    .eq("id", propertyId)
    .eq("agency_id", agency.id);
  if (error) {
    console.error("Failed to withdraw property", error);
    return;
  }
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
}

export async function updatePropertyAction(
  propertyId: string,
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
    inspection_information: formData.get("inspection_information") || undefined,
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
      : null;

  const { error } = await supabase
    .from("properties")
    .update({ ...parsed.data, price_display: priceDisplay })
    .eq("id", propertyId)
    .eq("agency_id", agency.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { success: true };
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadPropertyImageAction(
  propertyId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("images")
    .eq("id", propertyId)
    .eq("agency_id", agency.id)
    .maybeSingle();
  if (!property) return { error: "Property not found" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload" };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { error: "Only JPEG, PNG, WebP, or GIF images are allowed" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Image must be under 5MB" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${agency.id}/${propertyId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("property-images")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("property-images").getPublicUrl(path);

  const existingImages = Array.isArray(property.images) ? (property.images as string[]) : [];
  const { error: updateError } = await supabase
    .from("properties")
    .update({ images: [...existingImages, publicUrl] })
    .eq("id", propertyId)
    .eq("agency_id", agency.id);
  if (updateError) return { error: updateError.message };

  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { success: true };
}

export async function removePropertyImageAction(propertyId: string, imageUrl: string) {
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("images")
    .eq("id", propertyId)
    .eq("agency_id", agency.id)
    .maybeSingle();
  if (!property) return;

  const existingImages = Array.isArray(property.images) ? (property.images as string[]) : [];
  const { error: updateError } = await supabase
    .from("properties")
    .update({ images: existingImages.filter((url) => url !== imageUrl) })
    .eq("id", propertyId)
    .eq("agency_id", agency.id);
  if (updateError) {
    console.error("Failed to remove property image reference", updateError);
    return;
  }

  const marker = "/property-images/";
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex !== -1) {
    const path = imageUrl.slice(markerIndex + marker.length);
    const { error: storageError } = await supabase.storage.from("property-images").remove([path]);
    if (storageError) console.error("Failed to remove property image from storage", storageError);
  }

  revalidatePath(`/dashboard/properties/${propertyId}`);
}
