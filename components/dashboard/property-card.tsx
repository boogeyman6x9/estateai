import Link from "next/link";
import Image from "next/image";
import { BedDouble, Bath, Car, MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/database";

type Property = Database["public"]["Tables"]["properties"]["Row"];

const STATUS_LABEL: Record<Property["status"], string> = {
  draft: "Draft",
  active: "Active",
  under_offer: "Under offer",
  sold: "Sold",
  leased: "Leased",
  withdrawn: "Withdrawn",
};

export function PropertyCard({ property }: { property: Property }) {
  const images = Array.isArray(property.images) ? (property.images as string[]) : [];
  const thumbnail = images[0];

  return (
    <Link href={`/dashboard/properties/${property.id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative flex h-36 items-center justify-center bg-navy-100 text-navy-700">
          {thumbnail ? (
            <Image src={thumbnail} alt={property.title} fill sizes="400px" className="object-cover" />
          ) : (
            <span className="font-display text-sm">{property.suburb}</span>
          )}
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-display text-base font-semibold text-navy-950">
              {property.title}
            </h3>
            <Badge variant={property.status === "active" ? "positive" : "secondary"}>
              {STATUS_LABEL[property.status]}
            </Badge>
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {property.suburb}
            {property.state ? `, ${property.state}` : ""}
          </p>
          <p className="font-mono text-sm font-medium text-navy-900">
            {property.price_display ?? "Price on application"}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}
              </span>
            )}
            {property.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
              </span>
            )}
            {property.parking_spaces != null && (
              <span className="flex items-center gap-1">
                <Car className="h-3.5 w-3.5" /> {property.parking_spaces}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
