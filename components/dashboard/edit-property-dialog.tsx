"use client";

import { useActionState, useState } from "react";
import { Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePropertyAction } from "@/lib/actions/properties";
import type { ActionResult } from "@/lib/actions/auth";
import type { Database } from "@/types/database";

type Property = Database["public"]["Tables"]["properties"]["Row"];

const initialState: ActionResult = {};

export function EditPropertyDialog({ property }: { property: Property }) {
  const [open, setOpen] = useState(false);
  const action = updatePropertyAction.bind(null, property.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [prevSuccess, setPrevSuccess] = useState(state.success);

  if (state.success !== prevSuccess) {
    setPrevSuccess(state.success);
    if (state.success) setOpen(false);
  }

  const features = Array.isArray(property.features) ? (property.features as string[]) : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit property</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit_title">Title</Label>
            <Input id="edit_title" name="title" defaultValue={property.title} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_property_type">Property type</Label>
              <Select name="property_type" defaultValue={property.property_type}>
                <SelectTrigger id="edit_property_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["house", "apartment", "townhouse", "villa", "land", "commercial", "other"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t[0].toUpperCase() + t.slice(1)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_listing_type">Listing type</Label>
              <Select name="listing_type" defaultValue={property.listing_type}>
                <SelectTrigger id="edit_listing_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For sale</SelectItem>
                  <SelectItem value="rent">For rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_status">Status</Label>
            <Select name="status" defaultValue={property.status}>
              <SelectTrigger id="edit_status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["draft", "active", "under_offer", "sold", "leased", "withdrawn"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1).replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_address">Address</Label>
            <Input id="edit_address" name="address" defaultValue={property.address} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_suburb">Suburb</Label>
              <Input id="edit_suburb" name="suburb" defaultValue={property.suburb} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_price">Price ($)</Label>
              <Input
                id="edit_price"
                name="price"
                type="number"
                defaultValue={property.price ?? undefined}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit_bedrooms">Bedrooms</Label>
              <Input
                id="edit_bedrooms"
                name="bedrooms"
                type="number"
                min={0}
                defaultValue={property.bedrooms ?? undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_bathrooms">Bathrooms</Label>
              <Input
                id="edit_bathrooms"
                name="bathrooms"
                type="number"
                min={0}
                defaultValue={property.bathrooms ?? undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit_parking_spaces">Parking</Label>
              <Input
                id="edit_parking_spaces"
                name="parking_spaces"
                type="number"
                min={0}
                defaultValue={property.parking_spaces ?? undefined}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_features">Features (comma separated)</Label>
            <Input id="edit_features" name="features" defaultValue={features.join(", ")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_description">Description</Label>
            <Textarea
              id="edit_description"
              name="description"
              rows={3}
              defaultValue={property.description ?? ""}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit_inspection_information">Inspection information</Label>
            <Textarea
              id="edit_inspection_information"
              name="inspection_information"
              rows={2}
              placeholder="Saturday 10:00–10:30 AM, or by private appointment."
              defaultValue={property.inspection_information ?? ""}
            />
          </div>

          {state?.error && (
            <p className="text-sm text-hot" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
