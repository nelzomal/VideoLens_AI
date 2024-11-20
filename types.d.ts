declare namespace MainPage {
  type ChromeTab = (typeof chrome.tabs)[number];

  type RecordingCommand =
    | {
        action: "captureBackground";
        recordStartTimeInSeconds: number;
        language?: string;
      }
    | { action: "stopCaptureBackground" };

  type AudioTranscribing =
    | { action: "checkModelsLoaded" }
    | { action: "loadWhisperModel" }
    | {
        action: "transcribe";
        data: Array<number>;
        language: string;
      };

  type MessageToBackground = RecordingCommand | AudioTranscribing;
}

declare namespace Offscreen {
  type MessageToBackground =
    | {
        action: "transcribe";
        data: Array<number>;
        language: string;
        target: "background";
      }
    | {
        action: "beginRecording";
        target: "background";
      };
}

declare namespace Background {
  type Chunks = { text: string; timestamp: [number, number | null] }[];

  type TranscriberData = {
    tps: number;
    text: string;
    chunks?: Chunks;
  };

  type ModelFileProgressItem = {
    file: string;
    loaded: number;
    progress: number;
    total: number;
    name: string;
    status: string;
  };

  type ModelFileMessage =
    | { status: "modelsLoaded"; result: boolean }
    | (ModelFileProgressItem & { status: "initiate" })
    | { status: "progress"; progress: number; file: string }
    | { status: "loading"; msg: string }
    | { status: "ready" }
    | { status: "done"; file: string };

  type TranscrbeMessage =
    | { status: "recordingStarted" }
    | {
        chunks: Chunks;
        tps: number;
        status: "transcribing";
      }
    | { status: "error"; error: Error }
    | {
        status: "completeChunk";
        data: { tps: number; chunks: Array<[string, string]> };
      };

  type CaptureContentMessage = {
    status: "captureContent";
    data: string;
  };
  // | { status: "stopCaptureConent" };

  type TogglePanelMessage = {
    status: "TOGGLE_PANEL";
  };

  type MessageToContent =
    | ModelFileMessage
    | TranscrbeMessage
    | CaptureContentMessage
    | TogglePanelMessage;

  type MessageToOffscreen = {
    action: "captureContent" | "stopCaptureContent";
    data?: string;
    target: "offscreen";
    tab: MainPage.ChromeTab;
  };
}

// Add this interface to your existing types
interface ChromeMediaTrackConstraints extends MediaTrackConstraints {
  chromeMediaSource?: string;
  chromeMediaSourceId?: string;
}

// Augment the existing MediaTrackConstraints
declare global {
  interface MediaTrackConstraints extends ChromeMediaTrackConstraints {}
}

interface Position {
  x: number;
  y: number;
}

// Global interface extension
interface WindowOrWorkerGlobalScope {
  readonly ai: AI;
}

// Declare global ai property
declare const ai: AI;

interface AI {
  readonly languageModel: AILanguageModelFactory;
}

interface AICreateMonitor extends EventTarget {
  ondownloadprogress: ((event: Event) => void) | null;
}

type AICreateMonitorCallback = (monitor: AICreateMonitor) => void;

type AICapabilityAvailability = "readily" | "after-download" | "no";

// Language Model interfaces and types
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

// Add this interface to your types.d.ts
interface AIDownloadProgressEvent extends Event {
  loaded: number;
  total: number;
}
