/**
 * Integration test — findMatchingProperties builds a real Supabase query, so
 * its filtering logic is verified against a real Postgres instance rather
 * than mocking the query builder. Requires real Supabase credentials.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createAdminClient } from "@/lib/supabase/server";
import { findMatchingProperties, getPropertyContext, toPropertyContext } from "@/lib/ai/matching";

const hasCreds = !!process.env.SUPABASE_SERVICE_ROLE_KEY && !!process.env.NEXT_PUBLIC_SUPABASE_URL;

describe.skipIf(!hasCreds)("findMatchingProperties (integration)", () => {
  let supabase: Awaited<ReturnType<typeof createAdminClient>>;
  let agencyId: string;
  const ids: Record<string, string> = {};

  beforeAll(async () => {
    supabase = await createAdminClient();

    const { data: agency, error: agencyError } = await supabase
      .from("agencies")
      .insert({ name: "Test Matching Agency", slug: `test-matching-${Date.now()}` })
      .select()
      .single();
    if (agencyError) throw agencyError;
    agencyId = agency.id;

    const fixtures = [
      {
        key: "cheapUnit",
        title: "Cheap Unit",
        property_type: "apartment" as const,
        listing_type: "rent" as const,
        status: "active" as const,
        price: 500,
        bedrooms: 1,
        bathrooms: 1,
        suburb: "Bondi",
      },
      {
        key: "familyHouse",
        title: "Family House",
        property_type: "house" as const,
        listing_type: "sale" as const,
        status: "active" as const,
        price: 900000,
        bedrooms: 4,
        bathrooms: 2,
        suburb: "Parramatta",
      },
      {
        key: "luxuryVilla",
        title: "Luxury Villa",
        property_type: "villa" as const,
        listing_type: "sale" as const,
        status: "active" as const,
        price: 2500000,
        bedrooms: 5,
        bathrooms: 4,
        suburb: "Manly",
      },
      {
        key: "draftHouse",
        title: "Draft House — never listed",
        property_type: "house" as const,
        listing_type: "sale" as const,
        status: "draft" as const,
        price: 850000,
        bedrooms: 4,
        bathrooms: 2,
        suburb: "Parramatta",
      },
    ];

    for (const f of fixtures) {
      const { key, ...insertFields } = f;
      const { data, error } = await supabase
        .from("properties")
        .insert({ agency_id: agencyId, address: "1 Test Street", ...insertFields })
        .select()
        .single();
      if (error) throw error;
      ids[key] = data.id;
    }
  });

  afterAll(async () => {
    if (agencyId) await supabase.from("agencies").delete().eq("id", agencyId);
  });

  it("never returns draft listings, even with no filters", async () => {
    const results = await findMatchingProperties(supabase, agencyId, {});
    expect(results.some((p) => p.id === ids.draftHouse)).toBe(false);
  });

  it("filters by listing type", async () => {
    const results = await findMatchingProperties(supabase, agencyId, { listingType: "rent" });
    expect(results.map((p) => p.id)).toEqual([ids.cheapUnit]);
  });

  it("filters by budget max, excluding pricier listings", async () => {
    const results = await findMatchingProperties(supabase, agencyId, { budgetMax: 1000000 });
    const resultIds = results.map((p) => p.id);
    expect(resultIds).toContain(ids.familyHouse);
    expect(resultIds).not.toContain(ids.luxuryVilla);
  });

  it("filters by minimum bedrooms", async () => {
    const results = await findMatchingProperties(supabase, agencyId, { bedrooms: 5 });
    expect(results.map((p) => p.id)).toEqual([ids.luxuryVilla]);
  });

  it("filters by suburb", async () => {
    const results = await findMatchingProperties(supabase, agencyId, { suburbs: ["Manly"] });
    expect(results.map((p) => p.id)).toEqual([ids.luxuryVilla]);
  });

  it("scopes strictly to the given agency — a different agency's properties never leak in", async () => {
    const results = await findMatchingProperties(supabase, "00000000-0000-0000-0000-000000000000", {});
    expect(results).toHaveLength(0);
  });

  it("getPropertyContext returns null instead of inventing a property for an unknown id", async () => {
    const context = await getPropertyContext(
      supabase,
      agencyId,
      "00000000-0000-0000-0000-000000000000"
    );
    expect(context).toBeNull();
  });

  it("toPropertyContext maps every field the AI relies on to ground its answers", async () => {
    const { data: row } = await supabase
      .from("properties")
      .select("*")
      .eq("id", ids.familyHouse)
      .single();
    const context = toPropertyContext(row!);
    expect(context).toMatchObject({
      id: ids.familyHouse,
      title: "Family House",
      propertyType: "house",
      listingType: "sale",
      bedrooms: 4,
      bathrooms: 2,
      suburb: "Parramatta",
    });
  });
});
