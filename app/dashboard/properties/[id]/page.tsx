import { notFound } from "next/navigation";
import { BedDouble, Bath, Car, MapPin } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyContext } from "@/lib/dashboard-context";
import { hasProFeatures } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EditPropertyDialog } from "@/components/dashboard/edit-property-dialog";
import { PropertyImagesCard } from "@/components/dashboard/property-images-card";
import { WithdrawPropertyButton } from "@/components/dashboard/withdraw-property-button";
import { GenerateMarketingDialog } from "@/components/dashboard/generate-marketing-dialog";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { agency } = await requireAgencyContext();
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("agency_id", agency.id)
    .maybeSingle();

  if (!property) notFound();

  const { count: leadCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("agency_id", agency.id)
    .eq("property_id", property.id);

  const features = Array.isArray(property.features) ? (property.features as string[]) : [];

  const images = Array.isArray(property.images) ? (property.images as string[]) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant={property.status === "active" ? "positive" : "secondary"}>
            {property.status.replace("_", " ")}
          </Badge>
          <h1 className="mt-2 font-display text-2xl font-semibold text-navy-950">
            {property.title}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {property.address}, {property.suburb} {property.state} {property.postcode}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GenerateMarketingDialog propertyId={property.id} locked={!hasProFeatures(agency)} />
          <EditPropertyDialog property={property} />
          {property.status !== "withdrawn" && (
            <WithdrawPropertyButton propertyId={property.id} />
          )}
        </div>
      </div>

      <PropertyImagesCard propertyId={property.id} images={images} />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 p-6">
          <p className="font-mono text-xl font-semibold text-navy-900">
            {property.price_display ?? "Price on application"}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" /> {property.bedrooms} bed
              </span>
            )}
            {property.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" /> {property.bathrooms} bath
              </span>
            )}
            {property.parking_spaces != null && (
              <span className="flex items-center gap-1">
                <Car className="h-4 w-4" /> {property.parking_spaces} car
              </span>
            )}
          </div>
          <div className="ml-auto rounded-md bg-navy-100 px-3 py-1.5 text-sm font-medium text-navy-900">
            {leadCount ?? 0} enquir{leadCount === 1 ? "y" : "ies"}
          </div>
        </CardContent>
      </Card>

      {property.description && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display text-base font-semibold text-navy-950">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">
              {property.description}
            </p>
          </CardContent>
        </Card>
      )}

      {features.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display text-base font-semibold text-navy-950">Features</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {features.map((f) => (
                <Badge key={f} variant="outline">
                  {f}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {property.inspection_information && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display text-base font-semibold text-navy-950">Inspections</h2>
            <p className="mt-2 text-sm text-ink-soft">{property.inspection_information}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
