import { TranscriptEntry } from "../types/transcript";

interface CopyViewProps {
  transcript: TranscriptEntry[];
  isTranscriptLoading: boolean;
  transcriptError: string | null;
  loadTranscript: () => void;
  handleTranscriptClick: (start: number) => void;
}

export function CopyView({
  transcript,
  isTranscriptLoading,
  transcriptError,
  loadTranscript,
  handleTranscriptClick,
}: CopyViewProps) {
  return (
    <div className="space-y-4 p-4 text-white">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">YouTube Transcript</h2>
        {transcript.length === 0 && (
          <button
            className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
            onClick={loadTranscript}
            disabled={isTranscriptLoading}
          >
            {isTranscriptLoading ? "Loading..." : "Load Transcript"}
          </button>
        )}
      </div>

      {transcriptError && (
        <div className="p-4 bg-red-900/50 rounded text-red-200">
          {transcriptError}
        </div>
      )}

      <div className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto">
        {transcript.map((entry, index) => (
          <div
            key={index}
            className="flex gap-6 p-3 hover:bg-gray-800 cursor-pointer transition-colors duration-150"
            onClick={() => handleTranscriptClick(entry.start)}
          >
            <span className="text-[#3ea6ff] font-medium min-w-[52px]">
              {Math.floor(entry.start / 60)}:
              {(entry.start % 60).toString().padStart(2, "0")}
            </span>
            <span className="text-gray-100">{entry.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
