import { TranscriptEntry } from "../../types/transcript";
import { useTranslate } from "./hooks/useTranslate";
import { useUrlChange } from "../../hooks/useUrlChange";
import { TabTemplate } from "../TabTemplate";
import { TranslateControls } from "./TranslateControls";
import { TranslateProgress } from "./TranslateProgress";
import { TranslateContent } from "./TranslateContent";

interface TranslateViewProps {
  transcript: TranscriptEntry[];
  isTranscriptLoading: boolean;
  transcriptError: string | null;
  loadTranscript: () => void;
}

export function TranslateView({
  transcript,
  isTranscriptLoading,
  transcriptError,
  loadTranscript,
}: TranslateViewProps) {
  const {
    translatedTranscript,
    isTranslating,
    resetTranslation,
    isTranslationDone,
  } = useTranslate(transcript);

  // Reset translation when URL changes
  useUrlChange(() => {
    resetTranslation();
  });

  return (
    <TabTemplate
      controls={
        !isTranslationDone && (
          <TranslateControls
            transcript={transcript}
            isTranscriptLoading={isTranscriptLoading}
            loadTranscript={loadTranscript}
          />
        )
      }
      progressSection={
        isTranslating && <TranslateProgress isTranslating={isTranslating} />
      }
      mainContent={
        <TranslateContent
          translatedTranscript={translatedTranscript}
          transcriptError={transcriptError}
        />
      }
      className="text-white"
    />
  );
}
