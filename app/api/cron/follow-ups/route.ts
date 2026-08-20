import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/server";

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 50;

/**
 * Picks up due follow_ups rows and "sends" them (spec section 20). No SMS/email
 * provider is wired up yet, so — per the build brief — this starts as an
 * in-app stub: the follow-up message is posted into the lead's conversation
 * (if it has one) and always logged to lead_events, so it's visible wherever
 * an agent is already looking. Swapping in a real channel later only touches
 * the `send` step below, not this sweep/retry/idempotency logic.
 *
 * Runs on a Vercel Cron schedule (see vercel.json) hitting this route. Vercel
 * sends `Authorization: Bearer $CRON_SECRET` automatically when that env var
 * is set on the deployment — see .env.example.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();

  const { data: dueFollowUps, error: fetchError } = await supabase
    .from("follow_ups")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const followUp of dueFollowUps ?? []) {
    try {
      if (followUp.conversation_id) {
        await supabase.from("messages").insert({
          conversation_id: followUp.conversation_id,
          agency_id: followUp.agency_id,
          sender_type: "system",
          content: followUp.message,
          metadata: { follow_up_id: followUp.id, channel: followUp.channel },
        });
      }

      await supabase.from("lead_events").insert({
        agency_id: followUp.agency_id,
        lead_id: followUp.lead_id,
        event_type: "follow_up_sent",
        actor_type: "system",
        data: { follow_up_id: followUp.id, channel: followUp.channel, message: followUp.message },
      });

      await supabase
        .from("follow_ups")
        .update({ status: "sent", executed_at: new Date().toISOString(), attempts: followUp.attempts + 1 })
        .eq("id", followUp.id);

      sent++;
    } catch (err) {
      const attempts = followUp.attempts + 1;
      await supabase
        .from("follow_ups")
        .update({
          attempts,
          status: attempts >= MAX_ATTEMPTS ? "failed" : "scheduled",
        })
        .eq("id", followUp.id);

      console.error(`Follow-up ${followUp.id} failed`, err);
      failed++;
    }
  }

  return NextResponse.json({ processed: dueFollowUps?.length ?? 0, sent, failed });
}
