"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WidgetMessage {
  role: "lead" | "ai";
  content: string;
}

interface ChatWidgetProps {
  agencyId: string;
  agencyName: string;
  assistantName: string;
  greeting: string;
  propertyId?: string;
  /**
   * "floating" (default) is the in-dashboard demo — the component positions
   * itself fixed bottom-right on the page. "embedded" is for the real
   * external embed: it fills whatever box the parent page's iframe gives it,
   * since the iframe itself (resized via postMessage — see widget.js) is what
   * does the floating/positioning on the host site.
   */
  variant?: "floating" | "embedded";
  onOpenChange?: (open: boolean) => void;
}

/**
 * The actual embeddable chat widget UI (spec section 19), talking to the
 * public /api/chat route — no Supabase session involved. Same component
 * powers the in-dashboard demo (Settings > Chat widget, variant="floating")
 * and the real external embed (app/widget/[agencyId], variant="embedded").
 */
export function ChatWidget({
  agencyId,
  agencyName,
  assistantName,
  greeting,
  propertyId,
  variant = "floating",
  onOpenChange,
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onOpenChange?.(open);
    // Only re-run when `open` itself changes — onOpenChange is expected to be
    // a stable-enough callback (or the caller's problem if not).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || pending) return;

    setMessages((prev) => [...prev, { role: "lead", content }]);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId,
          conversationId: conversationId ?? undefined,
          propertyId,
          message: content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");

      setConversationId(data.conversationId);
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  const embedded = variant === "embedded";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        className={cn(
          "flex items-center justify-center rounded-full bg-navy-900 text-white shadow-lg transition-transform hover:scale-105",
          embedded ? "h-full w-full" : "fixed bottom-6 right-6 z-50 h-14 w-14"
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-2xl",
        embedded
          ? "h-full w-full"
          : "fixed bottom-6 right-6 z-50 h-[520px] w-96 max-w-[calc(100vw-3rem)]"
      )}
    >
      <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white">
        <div>
          <p className="text-sm font-semibold">{assistantName}</p>
          <p className="text-xs text-navy-200">{agencyName}</p>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-navy-800">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="max-w-[85%] rounded-lg bg-secondary px-3 py-2 text-sm text-foreground">
          {greeting}
        </div>
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
              m.role === "lead" ? "ml-auto bg-navy-900 text-white" : "bg-secondary text-foreground"
            )}
          >
            {m.content}
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Typing…
          </div>
        )}
      </div>

      {error && (
        <p className="border-t border-border px-4 py-2 text-xs text-hot" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={pending}
          className="flex-1 rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        />
        <Button type="submit" size="icon" disabled={pending || !input.trim()} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
