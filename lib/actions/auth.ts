"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  createAgencySchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/validation/auth";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function signUpAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });

  if (error) return { error: error.message };

  redirect("/onboarding");
}

export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: "Incorrect email or password." };

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/reset-password`,
  });

  // Always report success to avoid leaking which emails have accounts.
  if (error) console.error("resetPasswordForEmail error", error);
  return { success: true };
}

export async function resetPasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function createAgencyAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = createAgencySchema.safeParse({
    agencyName: formData.get("agencyName"),
    agencySlug: formData.get("agencySlug"),
    agencyPhone: formData.get("agencyPhone") || undefined,
    agencyEmail: formData.get("agencyEmail") || undefined,
    agencyWebsite: formData.get("agencyWebsite") || undefined,
    agencyAddress: formData.get("agencyAddress") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data: agency, error } = await supabase.rpc("create_agency_for_current_user", {
    agency_name: parsed.data.agencyName,
    agency_slug: parsed.data.agencySlug,
  });

  if (error) {
    if (error.message.includes("duplicate key")) {
      return { error: "That agency URL is already taken — try another." };
    }
    return { error: error.message };
  }

  const { agencyPhone, agencyEmail, agencyWebsite, agencyAddress } = parsed.data;
  if (agency && (agencyPhone || agencyEmail || agencyWebsite || agencyAddress)) {
    // Best-effort: the agency itself was already created above (the part that
    // can't be retried — the RPC blocks a second call once an account has an
    // agency), so a failure here shouldn't strand the user mid-wizard. They
    // can fix contact details later from Settings.
    const { error: contactError } = await supabase
      .from("agencies")
      .update({
        phone: agencyPhone || undefined,
        email: agencyEmail || undefined,
        website: agencyWebsite || undefined,
        address: agencyAddress || undefined,
      })
      .eq("id", agency.id);
    if (contactError) console.error("Failed to save agency contact details", contactError);
  }

  return { success: true };
}
