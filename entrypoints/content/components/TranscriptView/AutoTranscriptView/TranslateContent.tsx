import { TranscriptEntry } from "../../../types/transcript";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScrollToBottom } from "../../../hooks/useScrollToBottom";
import TranscriptEntryItem from "../TranscriptEntryItem";
import { useEffect, useRef } from "react";

interface TranslateContentProps {
  translatedTranscript: TranscriptEntry[];
  transcriptError: string | null;
  currentTime?: number;
}

export function TranslateContent({
  translatedTranscript,
  transcriptError,
  currentTime = 0,
}: TranslateContentProps) {
  const scrollRef = useScrollToBottom([
    translatedTranscript.length,
    translatedTranscript[translatedTranscript.length - 1]?.translation,
  ]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentTime || !containerRef.current) return;

    const currentEntry = translatedTranscript.find((entry, index) => {
      const nextEntry = translatedTranscript[index + 1];
      const isMatch =
        entry.start <= currentTime &&
        (!nextEntry || nextEntry.start > currentTime);
      return isMatch;
    });

    if (currentEntry) {
      const entryElement = containerRef.current.querySelector(
        `[data-time="${currentEntry.start}"]`
      );
      if (entryElement) {
        entryElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentTime, translatedTranscript]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div ref={containerRef} className="space-y-4 p-4 h-full overflow-auto">
          {transcriptError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-md text-red-600">
              {transcriptError}
            </div>
          )}
          {translatedTranscript.map(
            (entry, index) =>
              typeof entry.start === "number" &&
              entry.text.trim() && (
                <TranscriptEntryItem
                  key={`${entry.start}-${entry.text}`}
                  entry={entry}
                  index={index}
                  data-time={entry.start}
                />
              )
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
