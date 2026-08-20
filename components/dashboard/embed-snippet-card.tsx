"use client";

import { toast } from "sonner";
import { Copy } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmbedSnippetCard({ snippet }: { snippet: string }) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — select and copy the text manually");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add it to your website</CardTitle>
        <CardDescription>
          Paste this snippet before the closing <code>&lt;/body&gt;</code> tag on your own
          website — works on any platform (WordPress, Wix, Squarespace, custom HTML). It shows
          the exact same chat bubble as the preview below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="overflow-x-auto rounded-md bg-navy-950 p-4 text-xs text-navy-100">
          <code>{snippet}</code>
        </pre>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
          Copy snippet
        </Button>

        <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Not sure where to paste it?</p>
          <ul className="mt-1.5 space-y-1">
            <li>
              <span className="font-medium text-foreground">WordPress</span> — Appearance &rarr;
              Theme File Editor &rarr; <code>footer.php</code>, just before{" "}
              <code>&lt;/body&gt;</code>. Or use a &quot;header/footer scripts&quot; plugin so it
              survives theme updates.
            </li>
            <li>
              <span className="font-medium text-foreground">Wix / Squarespace / GoDaddy</span> —
              look for a &quot;Custom Code&quot; or &quot;Embed&quot; setting under site-wide
              settings — no file editing needed.
            </li>
            <li>
              <span className="font-medium text-foreground">Shopify</span> —{" "}
              <code>theme.liquid</code>, just before <code>&lt;/body&gt;</code>.
            </li>
            <li>
              <span className="font-medium text-foreground">Custom HTML site</span> — paste it
              into every page template right before <code>&lt;/body&gt;</code>.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
