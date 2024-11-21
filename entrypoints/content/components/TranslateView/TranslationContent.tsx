import { TranscriptEntry } from "../../types/transcript";
import { TranslationEntry } from "./TranslationEntry";
import { ScrollContent } from "../common/ScrollContent";

interface TranslationContentProps {
  isTranslating: boolean;
  translatedTranscript: TranscriptEntry[];
}

export const TranslationContent = ({
  isTranslating,
  translatedTranscript,
}: TranslationContentProps) => (
  <ScrollContent className="space-y-0.5">
    {isTranslating && translatedTranscript.length > 0 && (
      <div className="p-3 text-blue-400">Translating transcript...</div>
    )}

    {translatedTranscript.map((entry, index) => (
      <TranslationEntry key={index} entry={entry} />
    ))}
  </ScrollContent>
);
