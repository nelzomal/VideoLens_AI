import { useState, useCallback, useContext, useRef } from "react";
import { PanelContext } from "./contexts/PanelContext";
import "../style.css";
import ChatTab from "./components/ChatTab";
import { TranscriptView } from "./components/TranscriptView";
import { Header } from "./components/Header";
import { useRecording } from "./hooks/useRecording";
import { useWhisperModel } from "./hooks/useWhisperModel";

const IS_WEBGPU_AVAILABLE = "gpu" in window.navigator && !!window.navigator.gpu;

const App = () => {
  const [activeTab, setActiveTab] = useState<"main" | "target" | "copy">(
    "main"
  );
  const { setIsOpen } = useContext(PanelContext);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  const sendMessageToBackground = useCallback(
    (message: MainPage.MessageToBackground) => {
      browser.runtime.sendMessage({ ...message, source: "inject" });
    },
    []
  );

  const { recordUI } = useRecording(sendMessageToBackground);

  const { isWhisperModelReady, isCheckingModels, progressItems, transcripts } =
    useWhisperModel(sendMessageToBackground);

  const notSupportedUI = () => {
    return (
      <div className="fixed w-screen h-screen bg-black z-10 bg-opacity-[92%] text-white text-2xl font-semibold flex justify-center items-center text-center">
        WebGPU is not supported
        <br />
        by this browser :&#40;
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "target":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Target Content</h2>
          </div>
        );
      case "copy":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Copy Content</h2>
          </div>
        );
      default:
        return IS_WEBGPU_AVAILABLE ? (
          <TranscriptView
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            isWhisperModelReady={isWhisperModelReady}
            isCheckingModels={isCheckingModels}
            recordUI={recordUI}
            progressItems={progressItems}
            transcripts={transcripts}
            sendMessageToBackground={sendMessageToBackground}
          />
        ) : (
          notSupportedUI()
        );
    }
  };

  return (
    <div className="h-full w-full bg-black">
      <div className="flex h-full flex-col">
        <Header
          dragHandleRef={dragHandleRef}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsOpen={setIsOpen}
        />
        <div className="flex-1 overflow-auto bg-black p-4 text-white">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
