"use client";

import { ChatWidget } from "@/components/dashboard/chat-widget";

// Must match the message type string in public/widget.js — that's the loader
// script running in the *parent* page, listening for this to know when to
// resize the iframe between bubble and panel size.
export const WIDGET_RESIZE_MESSAGE = "estateai:widget-resize";

export function WidgetEmbedFrame({
  agencyId,
  agencyName,
  assistantName,
  greeting,
}: {
  agencyId: string;
  agencyName: string;
  assistantName: string;
  greeting: string;
}) {
  return (
    <div className="fixed inset-0">
      <ChatWidget
        agencyId={agencyId}
        agencyName={agencyName}
        assistantName={assistantName}
        greeting={greeting}
        variant="embedded"
        onOpenChange={(open) => {
          window.parent.postMessage({ type: WIDGET_RESIZE_MESSAGE, open }, "*");
        }}
      />
    </div>
  );
}
