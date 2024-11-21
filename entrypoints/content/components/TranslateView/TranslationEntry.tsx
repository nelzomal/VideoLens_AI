import { TranscriptEntry } from "../../types/transcript";
import { handleTranscriptClick } from "../../lib/utils";

interface TranslationEntryProps {
  entry: TranscriptEntry;
}

export const TranslationEntry = ({ entry }: TranslationEntryProps) => (
  <div
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
);
