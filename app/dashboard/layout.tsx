import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { TrialBanner } from "@/components/dashboard/trial-banner";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { createClient } from "@/lib/supabase/server";
import { getNotifications } from "@/lib/notifications";
import { isTrialExpired, trialHoursRemaining } from "@/lib/subscription";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout wraps every dashboard page, including Settings — the one
  // page an expired-trial agency must still be able to reach to pay. The
  // actual lockout redirect happens per-page via the default (blocking)
  // requireAgencyContext() call each page already makes for its own data.
  const { profile, agency } = await requireAgencyContext({ allowExpiredTrial: true });
  const supabase = await createClient();
  const notifications = await getNotifications(supabase, agency.id);
  const hoursRemaining = trialHoursRemaining(agency);
  const showTrialBanner = agency.subscription_status === "trialing" && !isTrialExpired(agency);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar agencyName={agency.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        {showTrialBanner && <TrialBanner hoursRemaining={hoursRemaining} />}
        <Topbar
          userName={profile.full_name ?? profile.email}
          userEmail={profile.email}
          notifications={notifications}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
