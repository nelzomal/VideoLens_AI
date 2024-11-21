import { useState } from "react";
import "../style.css";
import { TranscriptView } from "./components/TranscriptView";
import { Header } from "./components/Header";
import { SummarizeView } from "./components/SummarizeView";
import { TranslateView } from "./components/TranslateView";
import { QAView } from "./components/QAView";
import { NoVideoMessage } from "./components/common/NoVideoMessage";
import { WebGPUMessage } from "./components/common/WebGPUMessage";
import { useYouTubeVideo } from "./hooks/useYouTubeVideo";

const IS_WEBGPU_AVAILABLE = "gpu" in window.navigator && !!window.navigator.gpu;

const App = () => {
  const [activeTab, setActiveTab] = useState<
    "transcript" | "summarize" | "copy" | "qa"
  >("transcript");
  const { isYouTubeVideo } = useYouTubeVideo();

  if (!isYouTubeVideo) {
    return <NoVideoMessage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "summarize":
        return <SummarizeView />;
      case "copy":
        return <TranslateView />;
      case "qa":
        return <QAView />;
      default:
        return IS_WEBGPU_AVAILABLE ? <TranscriptView /> : <WebGPUMessage />;
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
