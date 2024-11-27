import { useState } from "react";
import "../style.css";
import { TranscriptView } from "./components/TranscriptView";
import { Header } from "./components/Header";
import { SummarizeView } from "./components/SummarizeView/SummarizeView";
import { QAView } from "./components/QAView/QAView";
import { checkAICapabilities } from "@/lib/ai";

const IS_WEBGPU_AVAILABLE = "gpu" in window.navigator && !!window.navigator.gpu;

const App = () => {
  const [activeTab, setActiveTab] = useState<"transcript" | "summarize" | "qa">(
    "transcript"
  );

  useEffect(() => {
    checkAICapabilities();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "summarize":
        return <SummarizeView />;
      case "qa":
        return <QAView />;
      default:
        return IS_WEBGPU_AVAILABLE ? (
          <TranscriptView />
        ) : (
          <div className="fixed w-screen h-screen bg-white z-10 text-gray-800 text-2xl font-medium flex justify-center items-center text-center">
            WebGPU is not supported
            <br />
            by this browser :&#40;
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full bg-white flex flex-col overflow-hidden rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-gray-200/50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
};

export default App;
