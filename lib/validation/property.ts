import { z } from "zod";

export const propertyTypeEnum = z.enum([
  "house", "apartment", "townhouse", "villa", "land", "commercial", "other",
]);
export const listingTypeEnum = z.enum(["sale", "rent"]);
export const propertyStatusEnum = z.enum([
  "draft", "active", "under_offer", "sold", "leased", "withdrawn",
]);

export const propertySchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  property_type: propertyTypeEnum,
  listing_type: listingTypeEnum,
  status: propertyStatusEnum.default("draft"),
  price: z.coerce.number().positive().optional(),
  price_display: z.string().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  parking_spaces: z.coerce.number().int().min(0).optional(),
  address: z.string().min(3, "Address is required"),
  suburb: z.string().min(2, "Suburb is required"),
  state: z.string().optional(),
  postcode: z.string().optional(),
  features: z.array(z.string()).default([]),
  inspection_information: z.string().optional(),
  agent_id: z.string().uuid().optional().nullable(),
});
export type PropertyInput = z.infer<typeof propertySchema>;
