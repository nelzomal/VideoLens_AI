import { useState } from "react";
import { Language } from "@/lib/constants";
import { RecordingStatus } from "@/entrypoints/content/types/transcript";
import { useWhisperModel } from "../../../hooks/useWhisperModel";
import { useTranslate } from "../hooks/useTranslate";
import { useScrollToBottom } from "../../../hooks/useScrollToBottom";
import { useVideoId } from "../../../hooks/useVideoId";
import { useUrlChange } from "../../../hooks/useUrlChange";
import { removeCachedData } from "@/lib/storage";
import { TabTemplate } from "../../TabTemplate";
import ProgressSection from "./ProgressSection";
import MainContent from "./MainContent";
import Controls from "./Controls";

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
        <Controls
          sourceLanguage={sourceLanguage}
          setSourceLanguage={setSourceLanguage}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          isWhisperModelReady={isWhisperModelReady}
          isCheckingModels={isCheckingModels}
          recordingStatus={recordingStatus}
          setRecordingStatus={setRecordingStatus}
        />
      }
      progressSection={<ProgressSection progressItems={progressItems} />}
      mainContent={
        <MainContent
          translatedTranscript={translatedTranscript}
          scrollRef={scrollRef}
          onCleanTranscripts={handleCleanTranscripts}
        />
      }
    />
  );
}
