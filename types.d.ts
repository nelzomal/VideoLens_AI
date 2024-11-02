declare namespace MainPage {
  type ChromeTab = (typeof chrome.tabs)[number];

  type RecordingCommand =
    | {
        action: "captureBackground";
        tab: ChromeTab;
        language?: string;
      }
    | { action: "stopCaptureBackground" };

  type AudioTranscribing =
    | { action: "loadWhisperModel" }
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
    | { status: "modelsLoaded" }
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
    | { status: "completeChunk"; data: { tps: number; chunks: Array<string> } };

  type CaptureContentMessage = {
    status: "captureContent";
    data: string;
  };
  // | { status: "stopCaptureConent" };

  type MessageFromBackground =
    | ModelFileMessage
    | TranscrbeMessage
    | CaptureContentMessage;
}
