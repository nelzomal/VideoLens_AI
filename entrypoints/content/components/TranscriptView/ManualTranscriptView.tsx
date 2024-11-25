import { ScrollArea } from "@/components/ui/scroll-area";
import LanguageSelector from "@/components/ui/LanguageSelector";
import {
  handleTranscriptClick,
  sendMessageToBackground,
} from "../../lib/utils";
import { useWhisperModel } from "../../hooks/useWhisperModel";
import { Recording } from "./Recording";
import FileProgress from "@/components/ui/FileProgress";
import { Trash2 } from "lucide-react";
import { removeTranscriptData } from "../../lib/storage";
import { useVideoId } from "../../hooks/useVideoId";
import { useUrlChange } from "../../hooks/useUrlChange";
import { TabTemplate } from "../TabTemplate";
import { useState } from "react";

export function ManualTranscriptView() {
  const {
    isWhisperModelReady,
    isCheckingModels,
    progressItems,
    transcripts,
    resetTranscripts,
  } = useWhisperModel();

  const videoId = useVideoId();
  const [videoLanguage, setVideoLanguage] = useState("english");

  // Reset transcripts when URL changes
  useUrlChange(() => {
    resetTranscripts();
    setVideoLanguage("english");
  });

  const handleCleanTranscripts = () => {
    resetTranscripts();
    if (videoId) {
      removeTranscriptData(videoId);
    }
  };

  return (
    <TabTemplate
      controls={
        <div className="w-full flex flex-row justify-between items-center">
          <LanguageSelector value={videoLanguage} onChange={setVideoLanguage} />
          {isWhisperModelReady ? (
            <Recording language={videoLanguage} />
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
                      language: videoLanguage,
                    })
                  }
                >
                  Load Models
                </button>
              )}
            </div>
          )}
        </div>
      }
      progressSection={
        progressItems.length > 0 && (
          <div className="w-full text-center">
            <label>Loading model files... (only run once)</label>
            {progressItems.map((data) => (
              <div key={data.file}>
                <FileProgress text={data.file} percentage={data.progress} />
              </div>
            ))}
          </div>
        )
      }
      mainContent={
        <div className="flex flex-col h-full">
          <div className="flex-none p-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold">Transcript</h2>
            <button
              onClick={handleCleanTranscripts}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors duration-150"
              title="Clear transcript"
            >
              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
            </button>
          </div>
          {transcripts.length > 0 && (
            <ScrollArea className="flex-grow">
              {transcripts.map((entry) => (
                <div
                  key={entry.start + entry.text}
                  className="flex flex-col p-3 hover:bg-gray-800 cursor-pointer transition-colors duration-150 gap-6"
                  onClick={() => handleTranscriptClick(entry.start)}
                >
                  <span className="text-[#3ea6ff] font-medium min-w-[52px]">
                    {Math.floor(entry.start / 60)}:
                    {(Math.floor(entry.start) % 60).toString().padStart(2, "0")}
                  </span>
                  <span className="text-gray-100">{entry.text}</span>
                </div>
              ))}
            </ScrollArea>
          )}
        </div>
      }
      className="text-white"
    />
  );
}
