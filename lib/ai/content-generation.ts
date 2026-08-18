import { getAIProvider } from "./provider";
import type { MarketingAssetType, PropertyContext } from "./types";

const ASSET_INSTRUCTIONS: Record<MarketingAssetType, string> = {
  listing_description:
    "Write a full property listing description, 150-220 words, evocative but factual — every claim must trace back to the given property data.",
  short_listing_description:
    "Write a short listing description, 40-60 words, for use in portal search results.",
  instagram_caption:
    "Write an Instagram caption, under 150 characters plus up to 5 relevant hashtags, energetic but not gimmicky.",
  facebook_post:
    "Write a Facebook post, 2-3 short paragraphs, inviting engagement and mentioning the inspection time if provided.",
  email_campaign:
    "Write a short marketing email with a subject line and a 3-paragraph body suitable for an agency's buyer database.",
  sms_announcement:
    "Write an SMS announcement under 160 characters, clear and direct, including the suburb and price.",
  open_home_reminder:
    "Write a friendly open-home reminder message, 2-3 sentences, as if sent the day before the inspection.",
};

function formatPropertyFacts(p: PropertyContext): string {
  return JSON.stringify(
    {
      title: p.title,
      type: p.propertyType,
      listingType: p.listingType,
      price: p.priceDisplay,
      suburb: p.suburb,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      parking: p.parkingSpaces,
      features: p.features,
      description: p.description,
      inspection: p.inspectionInformation,
    },
    null,
    2
  );
}

/**
 * Powers "Generate Marketing" on the property page (spec section 23). Never
 * publishes anything automatically — the UI is responsible for a copy/export
 * action only.
 */
export async function generateMarketingAsset(
  property: PropertyContext,
  assetType: MarketingAssetType
): Promise<string> {
  const provider = getAIProvider();

  const system = `You are a real-estate marketing copywriter. You only use the facts given to you about a property — never invent details, price, or features that are not listed. If the facts are insufficient for a strong asset, work with what's there rather than fabricating.

Task: ${ASSET_INSTRUCTIONS[assetType]}

Respond with ONLY the finished copy — no preamble, no explanation, no markdown headers.`;

  return provider.complete({
    system,
    messages: [{ role: "user", content: `Property facts:\n${formatPropertyFacts(property)}` }],
    maxTokens: 500,
    temperature: 0.7,
  });
}

export async function generateAllMarketingAssets(
  property: PropertyContext
): Promise<Record<MarketingAssetType, string>> {
  const types = Object.keys(ASSET_INSTRUCTIONS) as MarketingAssetType[];
  const results = await Promise.all(types.map((t) => generateMarketingAsset(property, t)));
  return Object.fromEntries(types.map((t, i) => [t, results[i]])) as Record<
    MarketingAssetType,
    string
  >;
}
