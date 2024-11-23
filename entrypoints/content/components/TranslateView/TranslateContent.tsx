import { TranscriptEntry } from "../../types/transcript";
import { handleTranscriptClick } from "../../lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
              <div
                key={index}
                className="flex flex-col p-3 hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                onClick={() => handleTranscriptClick(entry.start)}
              >
                <div className="flex gap-6">
                  <span className="text-[#3ea6ff] font-medium min-w-[52px]">
                    {Math.floor(entry.start / 60)}:
                    {(entry.start % 60).toString().padStart(2, "0")}
                  </span>
                  <span className="text-gray-100">{entry.text}</span>
                </div>
                {entry.translation && (
                  <div className="flex gap-6 mt-1">
                    <span className="text-[#3ea6ff] font-medium min-w-[52px]"></span>
                    <span className="text-gray-400">{entry.translation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
