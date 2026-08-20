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
      </CardContent>
    </Card>
  );
}
