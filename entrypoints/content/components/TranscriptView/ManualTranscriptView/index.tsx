import { ScrollArea } from "@/components/ui/scroll-area";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { sendMessageToBackground } from "../../../lib/utils";
import { useWhisperModel } from "../../../hooks/useWhisperModel";
import { Recording } from "./Recording";
import FileProgress from "@/components/ui/FileProgress";
import { Trash2 } from "lucide-react";
import { removeTranscriptData } from "../../../lib/storage";
import { useVideoId } from "../../../hooks/useVideoId";
import { useUrlChange } from "../../../hooks/useUrlChange";
import { TabTemplate } from "../../TabTemplate";
import { useState, memo } from "react";
import { useTranslate } from "../hooks/useTranslate";
import { Button } from "@/components/ui/button";
import { useScrollToBottom } from "../../../hooks/useScrollToBottom";
import TranscriptEntryItem from "../TranscriptEntryItem";
import { Language } from "@/lib/constants";

export function ManualTranscriptView() {
  const {
    isWhisperModelReady,
    isCheckingModels,
    progressItems,
    transcripts,
    resetTranscripts,
  } = useWhisperModel();

  const { translatedTranscript } = useTranslate({
    transcript: transcripts,
    isLive: true,
  });

  const videoId = useVideoId();
  const [videoLanguage, setVideoLanguage] = useState<Language>("english");

  // Use scroll to bottom hook
  const scrollRef = useScrollToBottom([
    translatedTranscript.length,
    translatedTranscript[translatedTranscript.length - 1]?.translation,
  ]);

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
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    Checking model status...
                  </div>
                )
              ) : (
                <Button
                  variant="mui-contained"
                  onClick={() =>
                    sendMessageToBackground({
                      action: "loadWhisperModel",
                      language: videoLanguage,
                    })
                  }
                >
                  Load Models
                </Button>
              )}
            </div>
          )}
        </div>
      }
      progressSection={
        progressItems.length > 0 && (
          <div className="w-full space-y-2">
            <label className="text-sm text-gray-600">
              Loading model files... (only run once)
            </label>
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
          <div className="flex-none px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
            <h2 className="text-lg font-medium text-gray-900">Transcript</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCleanTranscripts}
              className="text-gray-500 hover:text-red-500 rounded-full"
              title="Clear transcript"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          {translatedTranscript.length > 0 && (
            <ScrollArea className="flex-1">
              <div ref={scrollRef} className="h-full overflow-auto">
                {translatedTranscript.map((entry, index) => (
                  <TranscriptEntryItem
                    key={`${entry.start}-${entry.text}`}
                    entry={entry}
                    index={index}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      }
    />
  );
}
