import { TranscriptEntry } from "../types/transcript";
import { handleTranscriptClick } from "../lib/utils";
import { useTranslate } from "../hooks/useTranslate";
import { useTranscript } from "../hooks/useTranscript";
import { useUrlChange } from "../hooks/useUrlChange";
import { useEffect } from "react";

export function TranslateView() {
  const {
    transcript,
    isTranscriptLoading,
    transcriptError,
    loadTranscript,
    resetTranscript,
  } = useTranscript();

  const { translatedTranscript, isTranslating } = useTranslate(transcript);

  // Load transcript on mount
  useEffect(() => {
    if (transcript.length === 0) {
      loadTranscript();
    }
  }, [loadTranscript]);

  // Handle URL changes
  useUrlChange(() => {
    resetTranscript();
    loadTranscript();
  });

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
        {isTranslating && transcript.length > 0 && (
          <div className="p-3 text-blue-400">Translating transcript...</div>
        )}

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
  );
}
