import { useEffect, useState } from "react";
import { ManualTranscriptView } from "./ManualTranscriptView";
import { AutoTranscriptView } from "./AutoTranscriptView";
import { usePersistedTranscript } from "../../hooks/usePersistedTranscript";
import { getIsYTBTranscript } from "@/lib/storage";
import { useVideoId } from "../../hooks/useVideoId";
import { checkTranslateCapability } from "@/lib/ai";

export function TranscriptView() {
  const [canTranslate, setCanTranslate] = useState<boolean | null>(null);
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

  const isYTBTranscript = getIsYTBTranscript(videoId!);
  const showTranslateWarning = canTranslate !== null && !canTranslate;

  const TranslateWarningMessage = () =>
    showTranslateWarning ? (
      <div className="p-2 text-center text-red-500 bg-red-50 border border-red-200 rounded">
        Translation feature is currently unavailable. Please check your settings
        and try again later.
      </div>
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

  return !isYTBTranscript && transcript.length > 0 ? (
    <AutoTranscriptView
      YTBTranscript={transcript}
      isTranscriptLoading={isTranscriptLoading}
      transcriptError={YTBTranscriptError}
      translateWarning={TranslateWarningMessage()}
    />
  ) : (
    <ManualTranscriptView translateWarning={TranslateWarningMessage()} />
  );
}
