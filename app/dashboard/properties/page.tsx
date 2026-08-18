import { Building2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { PropertyCard } from "@/components/dashboard/property-card";
import { CreatePropertyDialog } from "@/components/dashboard/create-property-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";

export default async function PropertiesPage() {
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("agency_id", agency.id)
    .neq("status", "withdrawn")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-navy-950">Properties</h2>
          <p className="text-sm text-muted-foreground">
            {properties?.length ?? 0} listing{properties?.length === 1 ? "" : "s"}
          </p>
        </div>
        <CreatePropertyDialog />
      </div>

      {!properties || properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Add your first listing so EstateAI's assistant can start answering enquiries about it."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
