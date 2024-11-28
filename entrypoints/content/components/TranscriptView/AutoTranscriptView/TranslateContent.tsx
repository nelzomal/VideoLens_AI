import { TranscriptEntry } from "../../../types/transcript";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScrollToBottom } from "../../../hooks/useScrollToBottom";
import TranscriptEntryItem from "../TranscriptEntryItem";

interface TranslateContentProps {
  translatedTranscript: TranscriptEntry[];
  transcriptError: string | null;
}

export function TranslateContent({
  translatedTranscript,
  transcriptError,
}: TranslateContentProps) {
  const scrollRef = useScrollToBottom([
    translatedTranscript.length,
    translatedTranscript[translatedTranscript.length - 1]?.translation,
  ]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="space-y-4 p-4 h-full overflow-auto">
          {transcriptError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-md text-red-600">
              {transcriptError}
            </div>
          )}

          <div>
            {translatedTranscript.map((entry, index) => (
              <TranscriptEntryItem key={index} entry={entry} index={index} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
