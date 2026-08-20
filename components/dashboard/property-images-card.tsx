"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  uploadPropertyImageAction,
  removePropertyImageAction,
} from "@/lib/actions/properties";
import type { ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = {};

export function PropertyImagesCard({
  propertyId,
  images,
}: {
  propertyId: string;
  images: string[];
}) {
  const action = uploadPropertyImageAction.bind(null, propertyId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [removePending, startRemoveTransition] = useTransition();
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  function handleRemove(url: string) {
    setRemovingUrl(url);
    startRemoveTransition(async () => {
      await removePropertyImageAction(propertyId, url);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((url) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-md border border-border">
                <Image src={url} alt="" fill sizes="200px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  disabled={removePending && removingUrl === url}
                  aria-label="Remove photo"
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-navy-950/80 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
                >
                  {removePending && removingUrl === url ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        <form ref={formRef} action={formAction} className="flex items-center gap-2">
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={pending}
            className="flex-1 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
          />
          <Button type="submit" variant="outline" size="sm" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </Button>
        </form>

        {state?.error && (
          <p className="text-sm text-hot" role="alert">
            {state.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
