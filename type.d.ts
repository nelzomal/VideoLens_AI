export {};

declare global {
  type AIModelAvailability = "readily" | "after-download" | "no";
  type AISummarizerType = "tl;dr" | "key-points" | "teaser" | "headline";
  type AISummarizerFormat = "plain-text" | "markdown";
  type AISummarizerLength = "short" | "medium" | "long";

  type AISummarizerCreateOptions = {
    type?: AISummarizerType;
    length?: AISummarizerLength;
    format?: AISummarizerFormat;
  };

  type AISummarizer = {
    capabilities: () => Promise<AISummarizerCapabilities>;
    create: (
      options?: AISummarizerCreateOptions
    ) => Promise<AISummarizerSession>;
  };

  type AISummarizerCapabilities = {
    available: AIModelAvailability;
  };

  type AIModelDownloadProgressEvent = {
    loaded: number;
    total: number;
  };

  type AIModelDownloadCallback = (string, AIModelDownloadProgressEvent) => void;

  type AISummarizerSession = {
    destroy: () => void;
    ready: Promise<void>;
    summarize: (string) => Promise<string>;
    addEventListener: AIModelDownloadCallback;
  };

  interface Window {
    ai: {
      summarizer?: AISummarizer;
    };
  }

  declare namespace MainPage {
    type ChromeTab = (typeof chrome.tabs)[number];

    type RecordingCommand =
      | {
          action: "startCapture";
          tab: ChromeTab;
          language?: string;
        }
      | { action: "stopCapture" };

    type AudioTranscribing =
      | { action: "checkModelsLoaded" }
      | { action: "loadModels" }
      | { action: "transcribe"; data: Array<number>; language: string };

    type MessageToBackground = RecordingCommand | AudioTranscribing;
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
      | { status: "ready" }
      | { status: "done"; file: string };

    type TranscrbeMessage =
      | {
          chunks: Chunks;
          tps: number;
          status: "transcribing";
        }
      | { status: "error"; error: Error }
      | { status: "startAgain" }
      | {
          status: "completeChunk";
          data: { tps: number; chunks: Array<string> };
        };

    type RecordTabMessage =
      | {
          status: "start-recording-tab";
          data: string;
        }
      | { status: "stop-recording" };

    type MessageToMain = ModelFileMessage | TranscrbeMessage | RecordTabMessage;
  }
}
