"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deletePropertyAction } from "@/lib/actions/properties";

export function WithdrawPropertyButton({ propertyId }: { propertyId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => {
        if (!confirm("Withdraw this listing? It will no longer show as active.")) return;
        startTransition(() => deletePropertyAction(propertyId));
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Withdraw
    </Button>
  );
}
