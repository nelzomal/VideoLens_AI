import { TranscriptEntry } from "../../types/transcript";
import { TranslationEntry } from "./TranslationEntry";

interface TranslationContentProps {
  isTranslating: boolean;
  translatedTranscript: TranscriptEntry[];
}

export const TranslationContent = ({
  isTranslating,
  translatedTranscript,
}: TranslationContentProps) => (
  <div className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto">
    {isTranslating && translatedTranscript.length > 0 && (
      <div className="p-3 text-blue-400">Translating transcript...</div>
    )}

    {translatedTranscript.map((entry, index) => (
      <TranslationEntry key={index} entry={entry} />
    ))}
  </div>
);
