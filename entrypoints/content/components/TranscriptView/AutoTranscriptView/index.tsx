import { TabTemplate } from "../../TabTemplate";
import { TranslateProgress } from "./TranslateProgress";
import { TranslateContent } from "./TranslateContent";
import { useTranslate } from "../hooks/useTranslate";
import { TranscriptEntry } from "../../../types/transcript";

interface AutoTranscriptViewProps {
  YTBTranscript: TranscriptEntry[];
  isTranscriptLoading: boolean;
  transcriptError: string | null;
}

export function AutoTranscriptView({
  YTBTranscript,
  isTranscriptLoading,
  transcriptError,
}: AutoTranscriptViewProps) {
  const { translatedTranscript, isTranslating } = useTranslate({
    transcript: YTBTranscript,
    isLive: false,
  });

  return (
    <TabTemplate
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
