import { TabTemplate } from "../../TabTemplate";
import { TranslateProgress } from "./TranslateProgress";
import { TranslateContent } from "./TranslateContent";
import { useTranslate } from "../hooks/useTranslate";
import { TranscriptEntry } from "../../../types/transcript";
import { useState, useEffect } from "react";
import { Language } from "@/lib/constants";
import { TranslateControls } from "./TranslateControls";
import { useVideoId } from "@/entrypoints/content/hooks/useVideoId";
import { getStoredLanguagePreferences } from "@/lib/storage";

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
  const videoId = useVideoId();
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Restore language preferences when component mounts
  useEffect(() => {
    if (videoId) {
      const storedPreferences = getStoredLanguagePreferences(videoId);
      setTargetLanguage(
        storedPreferences ? storedPreferences.targetLanguage : "chinese"
      );
    }
  }, [videoId]);

  const { translatedTranscript, isTranslating, resetTranslation } =
    useTranslate({
      transcripts: YTBTranscript,
      isLive: false,
      sourceLanguage: "english",
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
        <TranslateControls
          targetLanguage={targetLanguage}
          setTargetLanguage={(lang) => {
            setTargetLanguage(lang);
            resetTranslation();
          }}
        />
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
