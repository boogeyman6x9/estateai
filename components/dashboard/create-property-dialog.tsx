"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus } from "lucide-react";

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
import { createPropertyAction } from "@/lib/actions/properties";
import type { ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = {};

export function CreatePropertyDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createPropertyAction, initialState);
  const [prevSuccess, setPrevSuccess] = useState(state.success);

  if (state.success !== prevSuccess) {
    setPrevSuccess(state.success);
    if (state.success) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add property
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a property</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Sun-Filled Family Home" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="property_type">Property type</Label>
              <Select name="property_type" defaultValue="house">
                <SelectTrigger id="property_type">
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
              <Label htmlFor="listing_type">Listing type</Label>
              <Select name="listing_type" defaultValue="sale">
                <SelectTrigger id="listing_type">
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
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="23 Smith Street" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="suburb">Suburb</Label>
              <Input id="suburb" name="suburb" placeholder="Parramatta" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" name="price" type="number" placeholder="950000" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" name="bedrooms" type="number" min={0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" name="bathrooms" type="number" min={0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parking_spaces">Parking</Label>
              <Input id="parking_spaces" name="parking_spaces" type="number" min={0} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="features">Features (comma separated)</Label>
            <Input id="features" name="features" placeholder="Pool, Air conditioning, Solar panels" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>

          {state?.error && (
            <p className="text-sm text-hot" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add property
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
