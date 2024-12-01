import { useEffect, useState } from "react";
import { ManualTranscriptView } from "./ManualTranscriptView";
import { AutoTranscriptView } from "./AutoTranscriptView";
import { usePersistedTranscript } from "../../hooks/usePersistedTranscript";
import { getIsYTBTranscript } from "@/lib/storage";
import { useVideoId } from "../../hooks/useVideoId";
import { checkTranslateCapability } from "@/lib/ai";
import { AIFeatureWarning } from "../shared/AIFeatureWarning";

export function TranscriptView() {
  const [canTranslate, setCanTranslate] = useState<boolean | null>(null);
  const [isYTBTranscript, setIsYTBTranscript] = useState<boolean | null>(null);
  const {
    transcript,
    isTranscriptLoading,
    YTBTranscriptError,
    loadYTBTranscript,
  } = usePersistedTranscript();
  const videoId = useVideoId();

  useEffect(() => {
    loadYTBTranscript();
    const checkCapability = async () => {
      const result = await checkTranslateCapability();
      setCanTranslate(result);
    };
    checkCapability();
  }, []);

  const showTranslateWarning = canTranslate !== null && !canTranslate;
  useEffect(() => {
    setIsYTBTranscript(getIsYTBTranscript(videoId!));
  }, [videoId]);

  const showTranslateWarningMessage = () =>
    showTranslateWarning ? (
      <AIFeatureWarning
        isLoading={canTranslate === null}
        isFeatureEnabled={canTranslate ?? false}
        feature="Chrome Translation AI"
        url="https://developer.chrome.com/docs/ai/translator-api"
      />
    ) : null;

  if (isTranscriptLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          Loading transcript...
        </div>
      </div>
    );
  }
  return isYTBTranscript !== false && transcript.length > 0 ? (
    <AutoTranscriptView
      YTBTranscript={transcript}
      isTranscriptLoading={isTranscriptLoading}
      transcriptError={YTBTranscriptError}
      translateWarning={showTranslateWarningMessage()}
    />
  ) : (
    <ManualTranscriptView translateWarning={showTranslateWarningMessage()} />
  );
  // return (
  //   <ManualTranscriptView translateWarning={showTranslateWarningMessage()} />
  // );
}
