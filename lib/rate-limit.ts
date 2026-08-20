import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Backed by the check_rate_limit Postgres function (migration 0013) — a
 * fixed-window counter that resets itself atomically, safe across concurrent
 * serverless invocations without any shared in-memory state.
 */
export async function checkRateLimit(
  supabase: SupabaseClient<Database>,
  key: string,
  { windowSeconds, maxRequests }: { windowSeconds: number; maxRequests: number }
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_window_seconds: windowSeconds,
    p_max_requests: maxRequests,
  });
  // Fail open: a rate-limit infra error shouldn't take down the whole
  // endpoint for every real visitor.
  if (error) {
    console.error("Rate limit check failed", error);
    return true;
  }
  return data === true;
}

/** Best-effort client IP from Vercel's forwarded headers; falls back to a shared bucket if unavailable. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
