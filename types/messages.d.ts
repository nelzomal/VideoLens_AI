declare namespace MainPage {
  type ChromeTab = (typeof chrome.tabs)[number];

  type RecordingCommand =
    | {
        action: "captureBackground";
        recordStartTimeInSeconds: number;
        language: string;
      }
    | { action: "stopCaptureBackground" };

  type AudioTranscribing =
    | { action: "checkModelsLoaded" }
    | { action: "loadWhisperModel"; language: string }
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
        data: { tps: number; chunks: Array<{ time: number; text: string }> };
      };

  type CaptureContentMessage = {
    status: "captureContent";
    data: string;
    language: string;
  };

  type TogglePanelMessage = {
    status: "TOGGLE_PANEL";
  };

  type MessageToContent =
    | ModelFileMessage
    | TranscrbeMessage
    | CaptureContentMessage
    | TogglePanelMessage;

  type MessageToOffscreen = (
    | {
        action: "captureContent";
        data: string;
        language: string;
      }
    | { action: "stopCaptureContent" }
  ) & {
    target: "offscreen";
    tab: MainPage.ChromeTab;
  };
}
