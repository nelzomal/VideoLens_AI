declare namespace MainPage {
  type ChromeTab = (typeof chrome.tabs)[number];

  type RecordingCommand =
    | {
        action: "captureBackground";
        // tab: ChromeTab;
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

  type MessageToOffscreen = {
    action: "stopRecording";
    target: "offscreen";
  };
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
    | {
        chunks: Chunks;
        tps: number;
        status: "transcribing";
      }
    | { status: "error"; error: Error }
    | { status: "startAgain" }
    | { status: "beginRecording" }
    | { status: "completeChunk"; data: { tps: number; chunks: Array<string> } };

  type CaptureContentMessage = {
    status: "captureContent";
    data: string;
  };
  // | { status: "stopCaptureConent" };

  type TogglePanelMessage = {
    status: "TOGGLE_PANEL";
  };

  type MessageToInject =
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
  create: (options?: AISummarizerCreateOptions) => Promise<AISummarizerSession>;
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
