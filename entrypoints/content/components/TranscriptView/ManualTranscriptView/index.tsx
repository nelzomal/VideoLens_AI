import { ScrollArea } from "@/components/ui/scroll-area";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { sendMessageToBackground } from "../../../lib/utils";
import { useWhisperModel } from "../../../hooks/useWhisperModel";
import { Recording } from "./Recording";
import FileProgress from "@/components/ui/FileProgress";
import { Trash2 } from "lucide-react";
import { removeCachedData } from "@/lib/storage";
import { useVideoId } from "../../../hooks/useVideoId";
import { useUrlChange } from "../../../hooks/useUrlChange";
import { TabTemplate } from "../../TabTemplate";
import { useState } from "react";
import { useTranslate } from "../hooks/useTranslate";
import { Button } from "@/components/ui/button";
import { useScrollToBottom } from "../../../hooks/useScrollToBottom";
import TranscriptEntryItem from "../TranscriptEntryItem";
import { Language } from "@/lib/constants";
import { RecordingStatus } from "@/entrypoints/content/types/transcript";

export function ManualTranscriptView() {
  const videoId = useVideoId();
  const [sourceLanguage, setSourceLanguage] = useState<Language>("english");
  const [targetLanguage, setTargetLanguage] = useState<Language>("chinese");
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("idle");

  const {
    isWhisperModelReady,
    isCheckingModels,
    progressItems,
    transcripts,
    resetTranscripts,
  } = useWhisperModel({ setRecordingStatus });

  const { translatedTranscript } = useTranslate({
    transcript: transcripts,
    isLive: true,
    language: sourceLanguage,
    targetLanguage: targetLanguage,
  });

  const scrollRef = useScrollToBottom([
    translatedTranscript.length,
    translatedTranscript[translatedTranscript.length - 1]?.translation,
  ]);

  useUrlChange(() => {
    resetTranscripts();
    setSourceLanguage("english");
    setTargetLanguage("chinese");
  });

  const handleCleanTranscripts = () => {
    resetTranscripts();
    if (videoId) {
      removeCachedData(videoId);
    }
  };

  return (
    <TabTemplate
      controls={
        <div className="w-full space-y-3">
          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm text-gray-600">Source Language</label>
              <LanguageSelector
                value={sourceLanguage}
                onChange={setSourceLanguage}
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm text-gray-600">Target Language</label>
              <LanguageSelector
                value={targetLanguage}
                onChange={setTargetLanguage}
              />
            </div>
          </div>
          <div className="w-full">
            {isWhisperModelReady ? (
              <Recording
                language={sourceLanguage}
                recordingStatus={recordingStatus}
                setRecordingStatus={setRecordingStatus}
              />
            ) : (
              <div className="w-full text-center">
                {isCheckingModels ? (
                  isCheckingModels !== true ? (
                    isCheckingModels
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-gray-600 text-base">
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      Checking model status...
                    </div>
                  )
                ) : (
                  <Button
                    variant="mui-contained"
                    size="lg"
                    className="shadow-sm text-base font-medium h-11 px-8"
                    onClick={() =>
                      sendMessageToBackground({
                        action: "loadWhisperModel",
                        language: sourceLanguage,
                      })
                    }
                  >
                    Load Models
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      }
      progressSection={
        progressItems.length > 0 && (
          <div className="w-full space-y-2">
            <label className="text-base text-gray-600">
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
              size="lg"
              onClick={handleCleanTranscripts}
              className="text-gray-500 hover:text-red-500 rounded-full h-11 w-11"
              title="Clear transcript"
            >
              <Trash2 className="w-5 h-5" />
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
