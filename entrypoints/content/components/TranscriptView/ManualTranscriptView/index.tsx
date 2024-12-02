import { useState, useEffect } from "react";
import { Language } from "@/lib/constants";
import { RecordingStatus } from "@/entrypoints/content/types/transcript";
import { useWhisperModel } from "../../../hooks/useWhisperModel";
import { useTranslate } from "../hooks/useTranslate";
import { useScrollToBottom } from "../../../hooks/useScrollToBottom";
import { useVideoId } from "../../../hooks/useVideoId";
import { useUrlChange } from "../../../hooks/useUrlChange";
import {
  removeCachedData,
  storeLanguagePreferences,
  getStoredLanguagePreferences,
} from "@/lib/storage";
import { TabTemplate } from "../../TabTemplate";
import ProgressSection from "./ProgressSection";
import MainContent from "./MainContent";
import Controls from "./Controls";

interface ManualTranscriptViewProps {
  translateWarning: React.ReactNode;
}

export const ManualTranscriptView: React.FC<ManualTranscriptViewProps> = ({
  translateWarning,
}) => {
  const videoId = useVideoId();
  const [sourceLanguage, setSourceLanguage] = useState<Language>("chinese");
  const [targetLanguage, setTargetLanguage] = useState<Language>("english");
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("idle");

  useEffect(() => {
    if (videoId) {
      const storedPreferences = getStoredLanguagePreferences(videoId);
      if (storedPreferences) {
        setSourceLanguage(storedPreferences.sourceLanguage);
        setTargetLanguage(storedPreferences.targetLanguage);
      }
    }
  }, [videoId]);

  useEffect(() => {
    if (videoId) {
      storeLanguagePreferences(videoId, sourceLanguage, targetLanguage);
    }
  }, [videoId, sourceLanguage, targetLanguage]);

  const {
    isWhisperModelReady,
    isCheckingModels,
    progressItems,
    transcripts,
    resetTranscripts,
  } = useWhisperModel({ setRecordingStatus });

  const { translatedTranscript, resetTranslation } = useTranslate({
    transcripts,
    isLive: true,
    sourceLanguage,
    targetLanguage,
    translateEnabled: !translateWarning,
  });

  const scrollRef = useScrollToBottom([
    translatedTranscript.length,
    translatedTranscript[translatedTranscript.length - 1]?.translation,
  ]);

  useUrlChange(() => {
    resetTranscripts();
  });

  const handleCleanTranscripts = () => {
    resetTranscripts();
    if (videoId) {
      removeCachedData(videoId);
      setSourceLanguage("chinese");
      setTargetLanguage("english");
    }
  };

  return (
    <TabTemplate
      controls={
        <Controls
          sourceLanguage={sourceLanguage}
          setSourceLanguage={(lang) => {
            setSourceLanguage(lang);
            resetTranslation();
          }}
          targetLanguage={targetLanguage}
          setTargetLanguage={(lang) => {
            setTargetLanguage(lang);
            resetTranslation();
          }}
          isWhisperModelReady={isWhisperModelReady}
          isCheckingModels={isCheckingModels}
          recordingStatus={recordingStatus}
          setRecordingStatus={setRecordingStatus}
        />
      }
      progressSection={
        <ProgressSection
          progressItems={progressItems}
          translateWarning={translateWarning}
        />
      }
      mainContent={
        <MainContent
          translatedTranscript={translatedTranscript}
          scrollRef={scrollRef}
          onCleanTranscripts={handleCleanTranscripts}
        />
      }
    />
  );
};
