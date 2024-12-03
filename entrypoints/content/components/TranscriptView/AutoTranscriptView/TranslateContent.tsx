import { TranscriptEntry } from "../../../types/transcript";
import ScrollArea from "@/components/ui/scroll-area";
import TranscriptEntryItem from "../TranscriptEntryItem";
import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentEntry, setCurrentEntry] = useState<TranscriptEntry | null>(
    null
  );

  useEffect(() => {
    if (!currentTime) {
      setCurrentEntry(null);
      return;
    }

    const entry = translatedTranscript.find((entry, index) => {
      const nextEntry = translatedTranscript[index + 1];
      return (
        entry.start <= currentTime &&
        (!nextEntry || nextEntry.start > currentTime)
      );
    });

    setCurrentEntry(entry || null);

    if (entry && containerRef.current) {
      const entryElement = containerRef.current.querySelector(
        `[data-time="${entry.start}"]`
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
                  isActive={entry === currentEntry}
                />
              )
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
