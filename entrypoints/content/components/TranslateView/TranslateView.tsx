import { useTranscript } from "../../hooks/useTranscript";
import { useTranslate } from "./hooks/useTranslate";
import { useUrlChange } from "../../hooks/useUrlChange";
import { TabTemplate } from "../TabTemplate";
import { TranslateControls } from "./TranslateControls";
import { TranslateProgress } from "./TranslateProgress";
import { TranslateContent } from "./TranslateContent";

export function TranslateView() {
  const { transcript, isTranscriptLoading, transcriptError, loadTranscript } =
    useTranscript();

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
        <TranslateProgress
          isTranslating={isTranslating}
          isTranscriptLoading={isTranscriptLoading}
        />
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
