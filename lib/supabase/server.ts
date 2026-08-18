import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Supabase client for use in Server Components, Route Handlers, and Server Actions.
 * Uses the anon key + the caller's session cookie, so RLS still applies per-user.
 * Never import the service-role key here or anywhere that runs in the browser.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no request context — safe to ignore
            // because the middleware refreshes the session on every request anyway.
          }
        },
      },
    }
  );
}

/**
 * Admin client using the service-role key. SERVER-ONLY. Never import this file
 * from a Client Component, and never forward its output to the browser.
 * Used for privileged operations that must bypass RLS (e.g. platform admin views,
 * background jobs, the follow-up scheduler).
 */
export async function createAdminClient() {
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
