import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { requireAgencyContext } from "@/lib/dashboard-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, agency } = await requireAgencyContext();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar agencyName={agency.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={profile.full_name ?? profile.email} userEmail={profile.email} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
