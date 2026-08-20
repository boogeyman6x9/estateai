"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Loader2, Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateMarketingAssetAction } from "@/lib/actions/marketing";
import type { MarketingAssetType } from "@/lib/ai";

const ASSET_TYPES: MarketingAssetType[] = [
  "listing_description",
  "short_listing_description",
  "instagram_caption",
  "facebook_post",
  "email_campaign",
  "sms_announcement",
  "open_home_reminder",
];

const ASSET_LABELS: Record<MarketingAssetType, string> = {
  listing_description: "Listing",
  short_listing_description: "Short",
  instagram_caption: "Instagram",
  facebook_post: "Facebook",
  email_campaign: "Email",
  sms_announcement: "SMS",
  open_home_reminder: "Open home",
};

export function GenerateMarketingDialog({
  propertyId,
  locked,
}: {
  propertyId: string;
  /** Trial/Starter agencies don't get AI marketing content — see lib/subscription.ts. */
  locked?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MarketingAssetType>("listing_description");
  const [results, setResults] = useState<Partial<Record<MarketingAssetType, string>>>({});
  const [errors, setErrors] = useState<Partial<Record<MarketingAssetType, string>>>({});
  const [loadingType, setLoadingType] = useState<MarketingAssetType | null>(null);
  const [, startTransition] = useTransition();

  function generate(type: MarketingAssetType) {
    setLoadingType(type);
    startTransition(async () => {
      const result = await generateMarketingAssetAction(propertyId, type);
      if ("error" in result) {
        setErrors((prev) => ({ ...prev, [type]: result.error }));
        setResults((prev) => ({ ...prev, [type]: undefined }));
      } else {
        setResults((prev) => ({ ...prev, [type]: result.content }));
        setErrors((prev) => ({ ...prev, [type]: undefined }));
      }
      setLoadingType(null);
    });
  }

  function handleTabChange(value: string) {
    const type = value as MarketingAssetType;
    setActiveTab(type);
    if (!results[type] && !errors[type] && loadingType !== type) {
      generate(type);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !results[activeTab] && !errors[activeTab] && loadingType === null) {
      generate(activeTab);
    }
  }

  async function handleCopy(type: MarketingAssetType) {
    const content = results[type];
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — select and copy the text manually");
    }
  }

  if (locked) {
    return (
      <Button
        variant="outline"
        onClick={() =>
          toast.info("Upgrade to Professional to unlock AI marketing content.", {
            action: { label: "View plans", onClick: () => router.push("/dashboard/settings?tab=billing") },
          })
        }
      >
        <Lock className="h-4 w-4" />
        Generate marketing
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="h-4 w-4" />
          Generate marketing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Marketing content</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="flex w-full flex-wrap h-auto">
            {ASSET_TYPES.map((type) => (
              <TabsTrigger key={type} value={type}>
                {ASSET_LABELS[type]}
              </TabsTrigger>
            ))}
          </TabsList>
          {ASSET_TYPES.map((type) => (
            <TabsContent key={type} value={type}>
              <div className="min-h-[220px] rounded-lg border border-border bg-muted p-4">
                {loadingType === type ? (
                  <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                  </div>
                ) : errors[type] ? (
                  <p className="text-sm text-hot" role="alert">
                    {errors[type]}
                  </p>
                ) : results[type] ? (
                  <p className="whitespace-pre-line text-sm text-foreground">{results[type]}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No content yet.</p>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loadingType === type}
                  onClick={() => generate(type)}
                >
                  {results[type] || errors[type] ? "Regenerate" : "Generate"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!results[type]}
                  onClick={() => handleCopy(type)}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
