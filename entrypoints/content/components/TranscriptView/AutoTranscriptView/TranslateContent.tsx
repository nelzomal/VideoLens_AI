import { TranscriptEntry } from "../../../types/transcript";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TranscriptEntryItem } from "../TranscriptEntryItem";

interface TranslateContentProps {
  translatedTranscript: TranscriptEntry[];
  transcriptError: string | null;
}

export function TranslateContent({
  translatedTranscript,
  transcriptError,
}: TranslateContentProps) {
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {transcriptError && (
            <div className="p-4 bg-red-900/50 rounded text-red-200">
              {transcriptError}
            </div>
          )}

          <div className="space-y-0.5">
            {translatedTranscript.map((entry, index) => (
              <TranscriptEntryItem key={index} entry={entry} index={index} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
