import { createAdminClient } from "@/lib/supabase/server";
import { WidgetEmbedFrame } from "@/components/widget/widget-embed-frame";

/**
 * The page a third-party website's iframe points at (see public/widget.js).
 * Fully public, no session — this is the real external embed (spec section
 * 19), separate from the in-dashboard demo on Settings > Chat widget which
 * uses the same ChatWidget component in variant="floating".
 */
export default async function WidgetEmbedPage({
  params,
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;
  const supabase = await createAdminClient();

  const { data: agency } = await supabase
    .from("agencies")
    .select("id, name")
    .eq("id", agencyId)
    .maybeSingle();

  const { data: aiSettings } = agency
    ? await supabase
        .from("ai_settings")
        .select("assistant_name, greeting, enabled")
        .eq("agency_id", agency.id)
        .maybeSingle()
    : { data: null };

  // Fail silently, not loudly: this renders inside a stranger's website via
  // iframe, so an unknown/disabled agency should just show nothing rather
  // than an error page leaking into someone else's site.
  if (!agency || !aiSettings?.enabled) {
    return (
      <>
        <style>{`html, body { background: transparent !important; }`}</style>
      </>
    );
  }

  return (
    <>
      <style>{`html, body { background: transparent !important; height: 100%; }`}</style>
      <WidgetEmbedFrame
        agencyId={agency.id}
        agencyName={agency.name}
        assistantName={aiSettings.assistant_name}
        greeting={aiSettings.greeting}
      />
    </>
  );
}
