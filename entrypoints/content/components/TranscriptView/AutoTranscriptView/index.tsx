import { TabTemplate } from "../../TabTemplate";
import { TranslateProgress } from "./TranslateProgress";
import { TranslateContent } from "./TranslateContent";
import { useTranslate } from "../hooks/useTranslate";
import { TranscriptEntry } from "../../../types/transcript";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useState, useEffect } from "react";
import { Language } from "@/lib/constants";

interface AutoTranscriptViewProps {
  YTBTranscript: TranscriptEntry[];
  isTranscriptLoading: boolean;
  transcriptError: string | null;
  translateWarning?: React.ReactNode;
}

export const AutoTranscriptView: React.FC<AutoTranscriptViewProps> = ({
  YTBTranscript,
  isTranscriptLoading,
  transcriptError,
  translateWarning,
}) => {
  const [targetLanguage, setTargetLanguage] = useState<Language>("chinese");
  const [currentTime, setCurrentTime] = useState(0);

  const { translatedTranscript, isTranslating } = useTranslate({
    transcripts: YTBTranscript,
    isLive: false,
    language: "english",
    targetLanguage,
    translateEnabled: !translateWarning,
  });

  // Add event listener for video time updates
  useEffect(() => {
    const video = document.querySelector("video");
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    // Also listen for seeking events
    video.addEventListener("seeking", handleTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeking", handleTimeUpdate);
    };
  }, []);

  return (
    <TabTemplate
      controls={
        <div className="w-full flex items-end gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-sm text-gray-600">Translate to</label>
            <LanguageSelector
              value={targetLanguage}
              onChange={setTargetLanguage}
            />
          </div>
        </div>
      }
      progressSection={
        <TranslateProgress
          isTranslating={isTranslating}
          isTranscriptLoading={isTranscriptLoading}
          translateWarning={translateWarning}
        />
      }
      mainContent={
        <TranslateContent
          translatedTranscript={translatedTranscript}
          transcriptError={transcriptError}
          currentTime={currentTime}
        />
      }
    />
  );
};
