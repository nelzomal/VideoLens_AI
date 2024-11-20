import { useState } from "react";
import "../style.css";
import ChatTab from "./components/ChatTab";
import { TranscriptView } from "./components/TranscriptView";
import { Header } from "./components/Header";
import { summarizeText } from "./lib/summarize";

const IS_WEBGPU_AVAILABLE = "gpu" in window.navigator && !!window.navigator.gpu;

const App = () => {
  const [activeTab, setActiveTab] = useState<
    "transcript" | "summarize" | "copy"
  >("transcript");
  const [text, setText] = useState(
    "This is a sample text that we want to summarize. It contains multiple sentences about various topics. The weather is nice today. AI technology is advancing rapidly. People are learning to adapt to new technologies."
  );
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const result = await summarizeText(text, undefined, (loaded, total) =>
        setProgress({ loaded, total })
      );
      setSummary(result);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "summarize":
        return (
          <div className="space-y-4 p-4 text-white">
            <h2 className="text-lg font-medium">Test Summarization</h2>
            <div className="space-y-4">
              <textarea
                className="w-full h-32 p-2 bg-gray-800 rounded"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to summarize..."
              />
              <button
                className="px-4 py-2 bg-blue-600 rounded"
                onClick={handleSummarize}
                disabled={isLoading}
              >
                {isLoading ? "Summarizing..." : "Summarize"}
              </button>
              {isLoading && progress.total > 0 && (
                <div>
                  Loading model:{" "}
                  {Math.round((progress.loaded / progress.total) * 100)}%
                </div>
              )}
              {summary && (
                <div className="mt-4">
                  <h3 className="text-md font-medium">Summary:</h3>
                  <p className="bg-gray-800 p-2 rounded mt-2">{summary}</p>
                </div>
              )}
            </div>
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
