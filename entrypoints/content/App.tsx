import Progress from "@/components/ui/Progress";
import { useState, useCallback, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelContext } from "./contexts/PanelContext";
import "../style.css";
import { Icons } from "./components/icons";
import { Button } from "@/components/ui/button";
import ChatTab from "./components/ChatTab";

const IS_WEBGPU_AVAILABLE = "gpu" in window.navigator && !!window.navigator.gpu;

// React component for injected content
const App = () => {
  const [activeTab, setActiveTab] = useState<"main" | "target" | "copy">(
    "main"
  );
  const { setIsOpen } = useContext(PanelContext);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [recordingStatus, setRecordingStatus] = useState<
    "loading" | "recording" | "stopped"
  >("stopped");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [isWhisperModelReady, setIsWhisperModelReady] = useState(false);
  const [isCheckingModels, setIsCheckingModels] = useState<boolean | string>(
    true
  );

  const [transcripts, setTranscripts] = useState<Array<[string, string]>>([]);
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
    sendMessageToBackground({ action: "checkModelsLoaded" });
  }, [sendMessageToBackground]);

  useEffect(() => {
    const handleResponse = (messageFromBg: Background.MessageToInject) => {
      // Handle responses from the background script

      if (messageFromBg.status === "beginRecording") {
        // start recording
        setRecordingStatus("recording");
      } else if (messageFromBg.status === "completeChunk") {
        setTranscripts((prev) => [...prev, ...messageFromBg.data.chunks]);
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

  const checkVideoStatus = useCallback(() => {
    const videoElement = document.querySelector("video");
    if (videoElement) {
      return !videoElement.paused && !videoElement.ended;
    }
    return false;
  }, []);

  const getVideoTimestamp = useCallback(() => {
    const videoElement = document.querySelector("video");
    if (videoElement) {
      return videoElement.currentTime;
    }
    return null;
  }, []);

  const recordTabAudio = useCallback(() => {
    const isPlaying = checkVideoStatus();
    const recordStartTimeInSeconds = getVideoTimestamp();

    if (isPlaying && recordStartTimeInSeconds) {
      sendMessageToBackground({
        action: "captureBackground",
        recordStartTimeInSeconds,
      });
    }
    setRecordingStatus("loading");
  }, [sendMessageToBackground, checkVideoStatus, getVideoTimestamp]);

  // TODO check and improve stop recording logic
  const stopRecording = useCallback(() => {
    sendMessageToBackground({ action: "stopCaptureBackground" });
    setRecordingStatus("stopped");
  }, []);

  useEffect(
    () => () => {
      if (recordingStatus === "recording") {
        stopRecording();
      }
    },
    [stopRecording, recordingStatus]
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

  const renderHeader = () => {
    return (
      <div
        ref={dragHandleRef}
        className="flex items-center justify-between border-b bg-black p-4 text-white cursor-move select-none"
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
          <h1 className="text-lg font-medium">Transcript & Summary</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setActiveTab("main")}
          >
            <Icons.refresh className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-white hover:bg-white/10 ${
              activeTab === "target" ? "bg-white/20" : ""
            }`}
            onClick={() => setActiveTab("target")}
          >
            <Icons.target className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`text-white hover:bg-white/10 ${
              activeTab === "copy" ? "bg-white/20" : ""
            }`}
            onClick={() => setActiveTab("copy")}
          >
            <Icons.copy className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            className="w-full text-white hover:bg-white/10"
            onClick={() => setIsOpen(false)}
          >
            <Icons.x className="mr-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "target":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Target Content</h2>
            {/* Add your copy-specific content here */}
          </div>
        );
      case "copy":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Copy Content</h2>
            {/* Add your copy-specific content here */}
          </div>
        );
      default:
        return renderTranscripts();
    }
  };

  const renderTranscripts = () => {
    return IS_WEBGPU_AVAILABLE ? (
      <div className="min-w-64 min-h-32 p-4 bg-black">
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
                    sendMessageToBackground({
                      action: "loadWhisperModel",
                    })
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
                <div className="flex justify-start p-4 space-y-4 flex-col">
                  {transcripts.map((entry, index) => (
                    <div key={index} className="space-y-1">
                      <div className="font-medium text-primary">
                        <span className="text-grey-400">{entry[0]}</span>
                        <span className="text-red-500">{entry[1]}</span>
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
    );
  };

  return (
    <div className="h-full w-full bg-black">
      <div className="flex h-full flex-col">
        {renderHeader()}
        <div className="flex-1 overflow-auto bg-black p-4 text-white">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
