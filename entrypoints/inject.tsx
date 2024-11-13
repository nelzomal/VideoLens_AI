import Progress from "@/components/ui/Progress";
import { APP_ID, WHISPER_SAMPLING_RATE } from "@/lib/constants";
import { createRoot } from "react-dom/client";
import { useState, useCallback, useRef, useEffect } from "react";
import "./style.css";
import { ScrollArea } from "@/components/ui/scroll-area";

const IS_WEBGPU_AVAILABLE = "gpu" in window.navigator && !!window.navigator.gpu;

// React component for injected content
export const InjectedComponent = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<
    "loading" | "recording" | "stopped"
  >("stopped");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [isWhisperModelReady, setIsWhisperModelReady] = useState(false);
  const [isCheckingModels, setIsCheckingModels] = useState<boolean | string>(
    true
  );
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [progressItems, setProgressItems] = useState<
    Array<Background.ModelFileProgressItem>
  >([]);

  const sendMessageToBackground = useCallback(
    (message: MainPage.MessageToBackground) => {
      browser.runtime.sendMessage({ ...message, source: "inject" });
    },
    []
  );

  // check if the model files have been downloaded
  useEffect(() => {
    if (isPanelOpen) {
      sendMessageToBackground({ action: "checkModelsLoaded" });
    }
  }, [sendMessageToBackground, isPanelOpen]);

  useEffect(() => {
    const handleResponse = (messageFromBg: Background.MessageToInject) => {
      // Handle responses from the background script

      if (messageFromBg.status === "TOGGLE_PANEL") {
        // inject the component in the page
        setIsPanelOpen(true);
      } else if (messageFromBg.status === "beginRecording") {
        // start recording
        setRecordingStatus("recording");
      } else if (messageFromBg.status === "completeChunk") {
        console.log("inject completeChunk: ", messageFromBg.data);
        setTranscripts((prev) => [...prev, messageFromBg.data.chunks[0]]);
      } else if (messageFromBg.status === "modelsLoaded") {
        // model files loaded
        setIsCheckingModels(false);
        setIsWhisperModelReady(messageFromBg.result);
        // Load the model files
      } else if (messageFromBg.status === "initiate") {
        setProgressItems((prev) => [...prev, messageFromBg]);
      } else if (messageFromBg.status === "progress") {
        setProgressItems((prev) =>
          prev.map((item) => {
            if (item.file === messageFromBg.file) {
              return {
                ...item,
                progress: messageFromBg.progress,
                file: messageFromBg.file,
              };
            }
            return item;
          })
        );
      } else if (messageFromBg.status === "done") {
        setProgressItems((prev) =>
          prev.filter((item) => item.file !== messageFromBg.file)
        );
      } else if (messageFromBg.status === "loading") {
        setIsCheckingModels(messageFromBg.msg);
      } else if (messageFromBg.status === "ready") {
        setIsWhisperModelReady(true);
      }
    };
    browser.runtime.onMessage.addListener(handleResponse);

    return () => {
      browser.runtime.onMessage.removeListener(handleResponse);
    };
  }, []);

  const recordTabAudio = useCallback(() => {
    sendMessageToBackground({ action: "captureBackground" });
    setRecordingStatus("loading");
  }, [sendMessageToBackground]);

  // TODO check and improve stop recording logic
  const stopRecording = useCallback(() => {
    sendMessageToBackground({ action: "stopCaptureBackground" });
    setRecordingStatus("stopped");
  }, []);

  useEffect(
    () => () => {
      if (isPanelOpen && recordingStatus === "recording") {
        console.log("stopRecording, inject");
        stopRecording();
      }
    },
    [stopRecording, isPanelOpen, recordingStatus]
  );

  const recordUI = useCallback(() => {
    return (
      <div className="flex flex-col items-center justify-between mb-4">
        Model files loaded
        {recordingStatus === "loading" ? (
          "Loading"
        ) : recordingStatus === "recording" ? (
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 my-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
            onClick={() => stopRecording()}
          >
            Stop Record
          </button>
        ) : (
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 my-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
            onClick={() => recordTabAudio()}
          >
            Record
          </button>
        )}
      </div>
    );
  }, [recordingStatus]);

  const notSupportedUI = () => {
    return (
      <div className="fixed w-screen h-screen bg-black z-10 bg-opacity-[92%] text-white text-2xl font-semibold flex justify-center items-center text-center">
        WebGPU is not supported
        <br />
        by this browser :&#40;
      </div>
    );
  };

  return isPanelOpen ? (
    IS_WEBGPU_AVAILABLE ? (
      <div className="min-w-64 min-h-32 p-4 bg-white">
        <div className="flex flex-col items-center justify-between mb-4 ">
          <div className="w-full mb-4">
            <LanguageSelector
              value={selectedLanguage}
              onChange={setSelectedLanguage}
            />
          </div>
          {isWhisperModelReady ? (
            recordUI()
          ) : (
            <div className="w-full text-center">
              {isCheckingModels ? (
                isCheckingModels !== true ? (
                  isCheckingModels
                ) : (
                  <div className="animate-pulse text-gray-600">
                    Checking model status...
                  </div>
                )
              ) : (
                <button
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
                  onClick={() =>
                    sendMessageToBackground({ action: "loadWhisperModel" })
                  }
                >
                  Load Models
                </button>
              )}
            </div>
          )}

          {progressItems.length > 0 && (
            <div className="relative z-10 p-4 w-full text-center">
              <label>Loading model files... (only run once)</label>
              {progressItems.map((data) => (
                <div key={data.file}>
                  <Progress text={data.file} percentage={data.progress} />
                </div>
              ))}
            </div>
          )}

          {transcripts.length > 0 && (
            <div className="flex flex-col h-full">
              <div className="flex-none p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Transcript</h2>
              </div>
              <ScrollArea className="flex-grow">
                <div className="p-4 space-y-4">
                  {transcripts.map((entry, index) => (
                    <div key={index} className="space-y-1">
                      <div className="font-medium text-primary">
                        <p className="text-red-500">{entry}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    ) : (
      notSupportedUI()
    )
  ) : null;
};

// Wait for the container to be created by the content script
const waitForContainer = () => {
  return new Promise<HTMLElement>((resolve) => {
    const check = () => {
      const container = document.querySelector(APP_ID);
      if (container) {
        resolve(container as HTMLElement);
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
};

export default defineUnlistedScript(async () => {
  const container = await waitForContainer();
  console.log("inject: before container", container);
  const root = createRoot(container);
  root.render(<InjectedComponent />);
});
