import { TranscriptEntry } from "../../types/transcript";
import { handleTranscriptClick } from "../../lib/utils";
import { memo } from "react";
interface TranscriptEntryItemProps {
  entry: TranscriptEntry;
  index: number;
  isActive?: boolean;
}

function TranscriptEntryItem({
  entry,
  index,
  isActive = false,
  ...props
}: TranscriptEntryItemProps) {
  return (
    <div
      key={index}
      className={`p-4 rounded-lg transition-colors ${
        isActive ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"
      }`}
      onClick={() => handleTranscriptClick(entry.start)}
      {...props}
    >
      <div className="flex gap-6">
        <span className="text-blue-600 font-medium min-w-[52px]">
          {Math.floor(entry.start / 60)}:
          {(Math.floor(entry.start) % 60).toString().padStart(2, "0")}
        </span>
        <span className="text-gray-900">{entry.text}</span>
      </div>
      {entry.translation && (
        <div className="flex gap-6 mt-1">
          <span className="text-blue-600 font-medium min-w-[52px]"></span>
          <span className="text-gray-600">{entry.translation}</span>
        </div>
      )}
    </div>
  );
}

export default memo(TranscriptEntryItem);
