// Global AI Interface
interface WindowOrWorkerGlobalScope {
  readonly ai: AI;
}

declare const ai: AI;

interface AI {
  readonly languageModel: AILanguageModelFactory;
  readonly summarizer?: AISummarizer;
}

// Common Types
type AICapabilityAvailability = "readily" | "after-download" | "no";

interface AIDownloadProgressEvent extends Event {
  readonly loaded: number;
  readonly total: number;
}

interface AICreateMonitor extends EventTarget {
  ondownloadprogress: ((event: Event) => void) | null;
}

type AICreateMonitorCallback = (monitor: AICreateMonitor) => void;

// Language Model Types
interface AILanguageModelFactory {
  create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>;
  capabilities(): Promise<AILanguageModelCapabilities>;
}

interface AILanguageModel extends EventTarget {
  prompt(
    input: string,
    options?: AILanguageModelPromptOptions
  ): Promise<string>;
  promptStreaming(
    input: string,
    options?: AILanguageModelPromptOptions
  ): ReadableStream;
  countPromptTokens(
    input: string,
    options?: AILanguageModelPromptOptions
  ): Promise<number>;
  readonly maxTokens: number;
  readonly tokensSoFar: number;
  readonly tokensLeft: number;
  readonly topK: number;
  readonly temperature: number;
  clone(): Promise<AILanguageModel>;
  destroy(): void;
}

interface AILanguageModelCapabilities {
  readonly available: AICapabilityAvailability;
  readonly defaultTopK: number | null;
  readonly maxTopK: number | null;
  readonly defaultTemperature: number | null;
}

interface AILanguageModelCreateOptions {
  signal?: AbortSignal;
  monitor?: AICreateMonitorCallback;
  systemPrompt?: string;
  initialPrompts?: AILanguageModelPrompt[];
  topK?: number;
  temperature?: number;
}

interface AILanguageModelPrompt {
  role: AILanguageModelPromptRole;
  content: string;
}

interface AILanguageModelPromptOptions {
  signal?: AbortSignal;
}

type AILanguageModelPromptRole = "system" | "user" | "assistant";

// Summarizer Types
type AISummarizerType = "tl;dr" | "key-points" | "teaser" | "headline";
type AISummarizerFormat = "plain-text" | "markdown";
type AISummarizerLength = "short" | "medium" | "long";

interface AISummarizer {
  capabilities(): Promise<AISummarizerCapabilities>;
  create(options?: AISummarizerCreateOptions): Promise<AISummarizerSession>;
}

interface AISummarizerCapabilities {
  readonly available: AICapabilityAvailability;
}

interface AISummarizerSession {
  destroy(): void;
  ready: Promise<void>;
  summarize(text: string): Promise<string>;
  addEventListener(
    type: string,
    callback: (event: AIDownloadProgressEvent) => void
  ): void;
}

type AISummarizerCreateOptions = {
  type?: AISummarizerType;
  length?: AISummarizerLength;
  format?: AISummarizerFormat;
};
