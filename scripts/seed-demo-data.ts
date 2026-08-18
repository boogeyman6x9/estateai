/**
 * Seeds a realistic demo agency so the product looks alive during development
 * and demos — kept entirely separate from the schema migrations (supabase/migrations).
 *
 * Usage:
 *   npx tsx scripts/seed-demo-data.ts
 *
 * Requires (in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (server-only key — never expose this to the browser)
 *
 * Demo accounts (all password: "Demo1234!"):
 *   owner@harbourandco.demo            — Agency owner
 *   sarah.mitchell@harbourandco.demo   — Agent
 *   james.wu@harbourandco.demo         — Agent
 *   olivia.bennett@harbourandco.demo   — Agent
 *   daniel.kim@harbourandco.demo       — Agent
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "Demo1234!";

const SUBURBS = [
  "Parramatta", "Newtown", "Bondi", "Chatswood", "Manly",
  "Surry Hills", "Marrickville", "Cronulla", "Hurstville", "Ryde",
];

const AGENT_SEED = [
  { first: "Sarah", last: "Mitchell", title: "Senior Sales Agent" },
  { first: "James", last: "Wu", title: "Sales Agent" },
  { first: "Olivia", last: "Bennett", title: "Sales Agent" },
  { first: "Daniel", last: "Kim", title: "Leasing Consultant" },
  { first: "Priya", last: "Nair", title: "Sales Agent" },
];

const PROPERTY_TEMPLATES: Array<{
  title: string;
  property_type: "house" | "apartment" | "townhouse" | "villa";
  listing_type: "sale" | "rent";
  price: number;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  features: string[];
}> = [
  { title: "Sun-Filled Family Home", property_type: "house", listing_type: "sale", price: 1250000, bedrooms: 4, bathrooms: 2, parking_spaces: 2, features: ["Pool", "Air conditioning", "Solar panels", "Renovated kitchen"] },
  { title: "Modern Inner-City Apartment", property_type: "apartment", listing_type: "sale", price: 780000, bedrooms: 2, bathrooms: 1, parking_spaces: 1, features: ["Balcony", "Gym", "Secure parking"] },
  { title: "Character Terrace with Courtyard", property_type: "townhouse", listing_type: "sale", price: 1050000, bedrooms: 3, bathrooms: 2, parking_spaces: 1, features: ["Courtyard", "Original features", "Split-system AC"] },
  { title: "Executive Waterside Villa", property_type: "villa", listing_type: "sale", price: 2100000, bedrooms: 5, bathrooms: 3, parking_spaces: 2, features: ["Water views", "Pool", "Home theatre", "Wine cellar"] },
  { title: "Cosy One-Bedroom Retreat", property_type: "apartment", listing_type: "rent", price: 620, bedrooms: 1, bathrooms: 1, parking_spaces: 0, features: ["Pet friendly", "Near station"] },
  { title: "Spacious Family Rental", property_type: "house", listing_type: "rent", price: 890, bedrooms: 4, bathrooms: 2, parking_spaces: 2, features: ["Fenced yard", "Air conditioning", "Dishwasher"] },
  { title: "Boutique Garden Apartment", property_type: "apartment", listing_type: "sale", price: 695000, bedrooms: 2, bathrooms: 1, parking_spaces: 1, features: ["Garden access", "North-facing", "Storage cage"] },
  { title: "Contemporary Townhouse Development", property_type: "townhouse", listing_type: "sale", price: 990000, bedrooms: 3, bathrooms: 2, parking_spaces: 2, features: ["Brand new", "Ducted AC", "Rooftop terrace"] },
  { title: "Classic Federation Home", property_type: "house", listing_type: "sale", price: 1580000, bedrooms: 4, bathrooms: 2, parking_spaces: 2, features: ["High ceilings", "Fireplace", "Wrap-around verandah"] },
  { title: "Light-Filled Studio", property_type: "apartment", listing_type: "rent", price: 480, bedrooms: 1, bathrooms: 1, parking_spaces: 0, features: ["Furnished option", "Bills included"] },
  { title: "Prestige Family Estate", property_type: "house", listing_type: "sale", price: 2850000, bedrooms: 5, bathrooms: 4, parking_spaces: 3, features: ["Tennis court", "Pool", "Home office", "Smart home"] },
  { title: "Renovator's Delight", property_type: "house", listing_type: "sale", price: 890000, bedrooms: 3, bathrooms: 1, parking_spaces: 1, features: ["Large block", "Development potential"] },
  { title: "Riverside Two-Bedroom Unit", property_type: "apartment", listing_type: "rent", price: 720, bedrooms: 2, bathrooms: 2, parking_spaces: 1, features: ["River views", "Balcony", "Gym"] },
  { title: "Elegant Semi-Detached Villa", property_type: "villa", listing_type: "sale", price: 1340000, bedrooms: 3, bathrooms: 2, parking_spaces: 2, features: ["Low maintenance", "Alfresco dining", "Ducted AC"] },
  { title: "Investor's Duplex Opportunity", property_type: "townhouse", listing_type: "sale", price: 1120000, bedrooms: 3, bathrooms: 2, parking_spaces: 2, features: ["Dual occupancy", "Separate meters"] },
];

const FIRST_NAMES = ["Sarah", "Michael", "Emma", "Liam", "Chloe", "Ryan", "Grace", "Noah", "Isabella", "Ethan", "Mia", "Jack", "Ava", "Lucas", "Sophie", "Henry", "Zoe", "Lachlan", "Ruby", "Oscar", "Ella", "Max", "Harper", "Leo", "Amelia", "Cooper", "Charlotte", "Hugo", "Willow", "Felix"];
const LAST_NAMES = ["Khan", "Nguyen", "Smith", "Taylor", "Brown", "Wilson", "Anderson", "Thomas", "White", "Harris", "Martin", "Clarke", "Walker", "Young", "King", "Scott", "Green", "Baker", "Adams", "Nelson"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function scoreToTemp(score: number): "hot" | "warm" | "cold" {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}

async function main() {
  console.log("Seeding EstateAI demo data for Harbour & Co Real Estate...");

  // 1. Owner user + agency
  const { data: ownerAuth, error: ownerAuthErr } = await supabase.auth.admin.createUser({
    email: "owner@harbourandco.demo",
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Harriet Cole" },
  });
  if (ownerAuthErr) throw ownerAuthErr;
  const ownerId = ownerAuth.user.id;

  const { data: agency, error: agencyErr } = await supabase
    .from("agencies")
    .insert({
      name: "Harbour & Co Real Estate",
      slug: "harbour-and-co",
      email: "hello@harbourandco.demo",
      phone: "+61 2 9555 0100",
      website: "https://harbourandco.demo",
      address: "12 Wharf Street, Sydney NSW 2000",
      subscription_plan: "professional",
      subscription_status: "active",
    })
    .select()
    .single();
  if (agencyErr) throw agencyErr;

  await supabase.from("profiles").update({ agency_id: agency.id, role: "owner" }).eq("id", ownerId);
  const { data: ownerAgent } = await supabase
    .from("agents")
    .insert({ agency_id: agency.id, profile_id: ownerId, title: "Principal" })
    .select()
    .single();

  await supabase.from("ai_settings").update({
    assistant_name: "Ivy",
    greeting: "Hi, I'm Ivy from Harbour & Co — thanks for your enquiry! How can I help?",
    custom_instructions: "Always be warm and professional. Prioritise arranging inspections for qualified buyers. Never invent property details.",
  }).eq("agency_id", agency.id);

  // 2. Agents
  const agentIds: string[] = [ownerAgent!.id];
  for (const a of AGENT_SEED) {
    const email = `${a.first.toLowerCase()}.${a.last.toLowerCase()}@harbourandco.demo`;
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: `${a.first} ${a.last}` },
    });
    if (authErr) throw authErr;

    await supabase.from("profiles").update({ agency_id: agency.id, role: "agent" }).eq("id", authUser.user.id);
    const { data: agentRow } = await supabase
      .from("agents")
      .insert({ agency_id: agency.id, profile_id: authUser.user.id, title: a.title })
      .select()
      .single();
    agentIds.push(agentRow!.id);
  }
  console.log(`Created ${agentIds.length} agents.`);

  // 3. Properties
  const propertyIds: string[] = [];
  for (const p of PROPERTY_TEMPLATES) {
    const suburb = pick(SUBURBS);
    const { data: prop, error } = await supabase
      .from("properties")
      .insert({
        agency_id: agency.id,
        agent_id: pick(agentIds),
        title: p.title,
        description: `A beautifully presented ${p.bedrooms}-bedroom ${p.property_type} in the heart of ${suburb}. ${p.features.slice(0, 2).join(" and ")} complete this exceptional offering.`,
        property_type: p.property_type,
        listing_type: p.listing_type,
        status: "active",
        price: p.price,
        price_display: p.listing_type === "rent" ? `$${p.price}/week` : `$${p.price.toLocaleString()}`,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        parking_spaces: p.parking_spaces,
        address: `${Math.floor(Math.random() * 200) + 1} ${pick(["Smith", "Wharf", "Park", "High", "Church", "George"])} Street`,
        suburb,
        state: "NSW",
        postcode: `${2000 + Math.floor(Math.random() * 200)}`,
        features: p.features,
        images: [],
        inspection_information: "Saturday 10:00–10:30 AM, or by private appointment.",
      })
      .select()
      .single();
    if (error) throw error;
    propertyIds.push(prop!.id);
  }
  console.log(`Created ${propertyIds.length} properties.`);

  // 4. Leads (+ a conversation, a few messages, and a lead_score_history entry each)
  const statuses: Array<"new" | "contacted" | "qualified" | "inspection_booked" | "negotiating" | "converted" | "lost"> =
    ["new", "contacted", "qualified", "inspection_booked", "negotiating", "converted", "lost"];

  for (let i = 0; i < 30; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const property = pick(propertyIds);
    const score = Math.floor(Math.random() * 101);
    const temperature = scoreToTemp(score);
    const status = pick(statuses);
    const agentId = pick(agentIds);

    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .insert({
        agency_id: agency.id,
        assigned_agent_id: agentId,
        property_id: property,
        first_name: first,
        last_name: last,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
        phone: `04${Math.floor(10000000 + Math.random() * 89999999)}`,
        lead_type: pick(["buyer", "renter", "investor"]),
        budget_min: 600000 + Math.floor(Math.random() * 10) * 50000,
        budget_max: 900000 + Math.floor(Math.random() * 15) * 50000,
        preferred_suburbs: [pick(SUBURBS), pick(SUBURBS)],
        bedrooms_required: 2 + Math.floor(Math.random() * 3),
        finance_status: pick(["unknown", "not_started", "in_progress", "pre_approved"]),
        purchase_timeline: pick(["Within 30 days", "1-3 months", "3-6 months", "Just researching"]),
        purpose: pick(["owner_occupier", "investment"]),
        lead_score: score,
        lead_temperature: temperature,
        status,
        source: pick(["website", "portal enquiry", "referral"]),
      })
      .select()
      .single();
    if (leadErr) throw leadErr;

    await supabase.from("lead_score_history").insert({
      agency_id: agency.id,
      lead_id: lead!.id,
      score,
      temperature,
      reason: "Initial AI qualification conversation",
      factors: { purchase_intent: true, budget_provided: true },
    });

    const { data: conversation } = await supabase
      .from("conversations")
      .insert({
        agency_id: agency.id,
        lead_id: lead!.id,
        property_id: property,
        channel: "website",
        status: status === "converted" || status === "lost" ? "closed" : "active",
      })
      .select()
      .single();

    await supabase.from("messages").insert([
      {
        conversation_id: conversation!.id,
        agency_id: agency.id,
        sender_type: "lead",
        content: "Hi, is this property still available?",
      },
      {
        conversation_id: conversation!.id,
        agency_id: agency.id,
        sender_type: "ai",
        content: `Yes, it's currently available! Are you looking to purchase for yourself or as an investment?`,
      },
    ]);

    if (status === "inspection_booked" || status === "negotiating" || status === "converted") {
      await supabase.from("appointments").insert({
        agency_id: agency.id,
        lead_id: lead!.id,
        property_id: property,
        agent_id: agentId,
        appointment_type: "inspection",
        scheduled_at: new Date(Date.now() + Math.floor(Math.random() * 7) * 86400000).toISOString(),
        status: "confirmed",
      });
    }

    if (status === "new" || status === "contacted") {
      await supabase.from("follow_ups").insert({
        agency_id: agency.id,
        lead_id: lead!.id,
        conversation_id: conversation!.id,
        scheduled_for: new Date(Date.now() + 86400000).toISOString(),
        channel: "website",
        message: `Hi ${first}, just checking whether you'd still like more information — happy to arrange an inspection if you'd like.`,
        status: "scheduled",
      });
    }
  }

  console.log("Seeded 30 leads with conversations, messages, appointments and follow-ups.");
  console.log("\nDone. Demo login: owner@harbourandco.demo / Demo1234!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
