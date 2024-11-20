import { useState, useEffect } from "react";
import "../style.css";
import ChatTab from "./components/ChatTab";
import { TranscriptView } from "./components/TranscriptView";
import { Header } from "./components/Header";
import { summarizeText } from "./lib/summarize";
import { getYouTubeTranscript, getCurrentVideoId } from "./lib/utils";
import { TranscriptEntry } from "./types/transcript";

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
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  useEffect(() => {
    const checkAndLoadTranscript = async () => {
      const videoId = getCurrentVideoId();
      if (videoId && videoId !== currentVideoId) {
        setCurrentVideoId(videoId);
        await loadTranscript();
      }
    };

    checkAndLoadTranscript();
  }, [currentVideoId]);

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

  const loadTranscript = async () => {
    console.log("Loading transcript...");
    setIsTranscriptLoading(true);
    setTranscriptError(null);

    try {
      const entries = await getYouTubeTranscript();
      console.log("Received transcript entries:", entries);

      if (entries.length === 0) {
        setTranscriptError(
          "No transcript found. Make sure you're on a YouTube video page with available transcripts."
        );
      } else {
        setTranscript(entries);
      }
    } catch (error) {
      console.error("Error loading transcript:", error);
      setTranscriptError(
        "Failed to load transcript: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsTranscriptLoading(false);
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
          <div className="space-y-4 p-4 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">YouTube Transcript</h2>
              {transcript.length === 0 && (
                <button
                  className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
                  onClick={loadTranscript}
                  disabled={isTranscriptLoading}
                >
                  {isTranscriptLoading ? "Loading..." : "Load Transcript"}
                </button>
              )}
            </div>

            {transcriptError && (
              <div className="p-4 bg-red-900/50 rounded text-red-200">
                {transcriptError}
              </div>
            )}

            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {transcript.map((entry, index) => (
                <div key={index} className="flex gap-4 p-2 bg-gray-800 rounded">
                  <span className="text-gray-400 min-w-[60px]">
                    {Math.floor(entry.start / 60)}:
                    {(entry.start % 60).toString().padStart(2, "0")}
                  </span>
                  <span>{entry.text}</span>
                </div>
              ))}
            </div>
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
