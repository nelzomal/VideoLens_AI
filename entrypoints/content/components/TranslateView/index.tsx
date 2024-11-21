import { useEffect } from "react";
import { useTranslate } from "../../hooks/useTranslate";
import { useTranscript } from "../../hooks/useTranscript";
import { useUrlChange } from "../../hooks/useUrlChange";
import { Header } from "./Header";
import { LoadTranscriptButton } from "./LoadTranscriptButton";
import { TranslationContent } from "./TranslationContent";

export function TranslateView() {
  const {
    transcript,
    isTranscriptLoading,
    transcriptError,
    loadTranscript,
    resetTranscript,
  } = useTranscript();

  const { translatedTranscript, isTranslating } = useTranslate(transcript);

  useEffect(() => {
    if (transcript.length === 0) {
      loadTranscript();
    }
  }, [loadTranscript]);

  useUrlChange(() => {
    resetTranscript();
    loadTranscript();
  });

  const loadButton =
    transcript.length === 0 ? (
      <LoadTranscriptButton
        isLoading={isTranscriptLoading}
        onClick={loadTranscript}
      />
    ) : null;

  return (
    <div className="space-y-4 p-4 text-white">
      <Header loadTranscriptButton={loadButton} />

      {transcriptError && (
        <div className="p-4 bg-red-900/50 rounded text-red-200">
          {transcriptError}
        </div>
      )}

      <TranslationContent
        isTranslating={isTranslating}
        translatedTranscript={translatedTranscript}
      />
    </div>
  );
}
