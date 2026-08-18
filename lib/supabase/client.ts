"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

/**
 * Supabase client for use in Client Components.
 * Only ever holds the public anon key — safe to ship to the browser.
 * RLS policies (see supabase/migrations) are what actually enforce access control.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
