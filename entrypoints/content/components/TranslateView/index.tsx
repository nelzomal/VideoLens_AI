import { useEffect } from "react";
import { useTranslate } from "../../hooks/useTranslate";
import { useTranscript } from "../../hooks/useTranscript";
import { useUrlChange } from "../../hooks/useUrlChange";
import { Header } from "./Header";
import { LoadTranscriptButton } from "./LoadTranscriptButton";
import { TranslationContent } from "./TranslationContent";
import { ScrollContent } from "../common/ScrollContent";

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
    <div className="flex flex-col h-full text-white">
      <div className="flex-shrink-0 p-4">
        <Header loadTranscriptButton={loadButton} />
      </div>

      {transcriptError && (
        <div className="flex-shrink-0 px-4">
          <div className="p-4 bg-red-900/50 rounded text-red-200">
            {transcriptError}
          </div>
        </div>
      )}

      <div className="flex-grow min-h-0">
        <ScrollContent>
          <div className="px-4">
            <TranslationContent
              isTranslating={isTranslating}
              translatedTranscript={translatedTranscript}
            />
          </div>
        </ScrollContent>
      </div>
    </div>
  );
}
