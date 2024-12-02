import { TranscriptEntry } from "../../types/transcript";
import { handleTranscriptClick } from "../../lib/utils";
import { memo } from "react";
interface TranscriptEntryItemProps {
  entry: TranscriptEntry;
  index: number;
  "data-time"?: number;
}

function TranscriptEntryItem({
  entry,
  index,
  ...props
}: TranscriptEntryItemProps) {
  return (
    <div
      key={index}
      className="flex flex-col p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 border-b border-gray-100"
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
