import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import TranscriptEntryItem from "../TranscriptEntryItem";
import { TranscriptEntry } from "@/entrypoints/content/types/transcript";

interface MainContentProps {
  translatedTranscript: TranscriptEntry[];
  scrollRef: React.RefObject<HTMLDivElement>;
  onCleanTranscripts: () => void;
}

export default function MainContent({
  translatedTranscript,
  scrollRef,
  onCleanTranscripts,
}: MainContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-none px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
        <h2 className="text-lg font-medium text-gray-900">Transcript</h2>
        <Button
          variant="ghost"
          size="lg"
          onClick={onCleanTranscripts}
          className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg h-12 w-18 flex items-center justify-center"
          title="Clear transcript"
        >
          <Trash2 className="w-6 h-6" />
        </Button>
      </div>
      {translatedTranscript.length > 0 && (
        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="h-full overflow-auto">
            {translatedTranscript.map(
              (entry, index) =>
                typeof entry.start === "number" &&
                entry.text.length > 0 && (
                  <TranscriptEntryItem
                    key={`${entry.start}-${entry.text}`}
                    entry={entry}
                    index={index}
                  />
                )
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
