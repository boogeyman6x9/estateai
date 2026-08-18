import { UserSquare2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InviteAgentDialog } from "@/components/dashboard/invite-agent-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AgentsPage() {
  const { agency, profile } = await requireAgencyContext();
  const supabase = await createClient();

  const { data: agents } = await supabase
    .from("agents")
    .select("id, title, active, profile_id")
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: true });

  const profileIds = (agents ?? []).map((a) => a.profile_id);
  const { data: agentProfiles } =
    profileIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .in("id", profileIds)
      : { data: [] as { id: string; full_name: string | null; email: string; role: string }[] };

  const profileById = new Map((agentProfiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-navy-950">Agents</h2>
          <p className="text-sm text-muted-foreground">
            {agents?.length ?? 0} team member{agents?.length === 1 ? "" : "s"}
          </p>
        </div>
        {profile.role === "owner" && <InviteAgentDialog />}
      </div>

      {!agents || agents.length === 0 ? (
        <EmptyState
          icon={UserSquare2}
          title="No agents yet"
          description="Invite your teammates so leads can be assigned and worked as they come in."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => {
            const p = profileById.get(agent.profile_id);
            return (
              <Card key={agent.id}>
                <CardContent className="flex items-center gap-4 p-5">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback>{initials(p?.full_name ?? null)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {p?.full_name ?? p?.email}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {agent.title ?? (p?.role === "owner" ? "Principal" : "Agent")}
                    </p>
                  </div>
                  <Badge variant={agent.active ? "positive" : "secondary"}>
                    {agent.active ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
