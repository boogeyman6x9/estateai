/**
 * The rest of the app (lib/ai/conversation.ts, qualification.ts, summarization.ts,
 * content-generation.ts) only ever talks to the AIProvider interface below, never
 * to a specific vendor SDK. To switch providers, add a new class here and point
 * AI_PROVIDER at it — nothing else in the codebase changes.
 *
 * SERVER-ONLY. Never import this file from a Client Component: it reads
 * ANTHROPIC_API_KEY, which must never reach the browser bundle.
 */

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CompleteOptions {
  system: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  readonly name: string;
  /** Free-form text completion. */
  complete(options: CompleteOptions): Promise<string>;
  /**
   * Completion constrained to a single JSON object matching the given shape.
   * Callers are responsible for validating the parsed result (e.g. with Zod).
   */
  completeJSON<T>(options: CompleteOptions): Promise<T>;
}

class AIConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIConfigurationError";
  }
}

class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "claude-sonnet-4-6") {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async request(options: CompleteOptions): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens ?? 1024,
        temperature: options.temperature ?? 0.4,
        system: options.system,
        messages: options.messages,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${body}`);
    }

    const data = await response.json();
    const textBlock = data.content?.find((block: { type: string }) => block.type === "text");
    if (!textBlock) {
      throw new Error("Anthropic API returned no text content");
    }
    return textBlock.text as string;
  }

  async complete(options: CompleteOptions): Promise<string> {
    return this.request(options);
  }

  async completeJSON<T>(options: CompleteOptions): Promise<T> {
    const text = await this.request({
      ...options,
      system: `${options.system}\n\nRespond with ONLY a single valid JSON object. No prose, no markdown code fences, no preamble.`,
    });
    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    return JSON.parse(cleaned) as T;
  }
}

/**
 * Thrown-on-use placeholder for when no provider is configured, so the rest of
 * the app can fail loudly and visibly instead of silently returning fake data.
 */
class UnconfiguredProvider implements AIProvider {
  readonly name = "unconfigured";

  async complete(): Promise<string> {
    throw new AIConfigurationError(
      "No AI provider is configured. Set ANTHROPIC_API_KEY in your environment to enable AI replies, qualification, summaries, and content generation."
    );
  }

  async completeJSON<T>(): Promise<T> {
    throw new AIConfigurationError(
      "No AI provider is configured. Set ANTHROPIC_API_KEY in your environment to enable AI replies, qualification, summaries, and content generation."
    );
  }
}

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = process.env.AI_PROVIDER ?? "anthropic";

  switch (providerName) {
    case "anthropic": {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      cachedProvider = apiKey ? new AnthropicProvider(apiKey) : new UnconfiguredProvider();
      break;
    }
    default:
      cachedProvider = new UnconfiguredProvider();
  }

  return cachedProvider;
}

export { AIConfigurationError };
