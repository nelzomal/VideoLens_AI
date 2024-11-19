import { useState } from "react";
import "../style.css";
import ChatTab from "./components/ChatTab";
import { TranscriptView } from "./components/TranscriptView";
import { Header } from "./components/Header";

const IS_WEBGPU_AVAILABLE = "gpu" in window.navigator && !!window.navigator.gpu;

const App = () => {
  const [activeTab, setActiveTab] = useState<"main" | "target" | "copy">(
    "main"
  );

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
