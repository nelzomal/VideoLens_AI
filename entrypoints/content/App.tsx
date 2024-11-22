import { useState } from "react";
import "../style.css";
import ChatTab from "./components/ChatTab";
import { TranscriptView } from "./components/TranscriptView";
import { Header } from "./components/Header";
import { SummarizeView } from "./components/SummarizeView/SummarizeView";
import { CopyView } from "./components/CopyView";
import { useTranscript } from "./hooks/useTranscript";
import { QAView } from "./components/QAView";
import { useUrlChange } from "./hooks/useUrlChange";

const IS_WEBGPU_AVAILABLE = "gpu" in window.navigator && !!window.navigator.gpu;

const App = () => {
  const [activeTab, setActiveTab] = useState<
    "transcript" | "summarize" | "copy" | "qa"
  >("transcript");
  const {
    transcript,
    isTranscriptLoading,
    transcriptError,
    loadTranscript,
    resetTranscript,
  } = useTranscript();

  // Handle URL changes
  useUrlChange(() => {
    resetTranscript();
  });

  const renderContent = () => {
    switch (activeTab) {
      case "summarize":
        return <SummarizeView />;
      case "copy":
        return (
          <CopyView
            transcript={transcript}
            isTranscriptLoading={isTranscriptLoading}
            transcriptError={transcriptError}
            loadTranscript={loadTranscript}
          />
        );
      case "qa":
        return <QAView />;
      default:
        return IS_WEBGPU_AVAILABLE ? (
          <TranscriptView />
        ) : (
          <div className="fixed w-screen h-screen bg-black z-10 bg-opacity-[92%] text-white text-2xl font-semibold flex justify-center items-center text-center">
            WebGPU is not supported
            <br />
            by this browser :&#40;
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full bg-black flex flex-col overflow-hidden">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
};

export default App;
