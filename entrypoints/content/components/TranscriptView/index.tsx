import { useEffect } from "react";
import { ManualTranscriptView } from "./ManualTranscriptView";
import { AutoTranscriptView } from "./AutoTranscriptView";
import { usePersistedTranscript } from "../../hooks/usePersistedTranscript";

export function TranscriptView() {
  const {
    transcript,
    isTranscriptLoading,
    YTBTranscriptError,
    loadYTBTranscript,
  } = usePersistedTranscript();

  useEffect(() => {
    loadYTBTranscript();
  }, []);

  if (isTranscriptLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          Loading transcript...
        </div>
      </div>
    );
  }

  return transcript.length > 0 && YTBTranscriptError === null ? (
    <AutoTranscriptView
      YTBTranscript={transcript}
      isTranscriptLoading={isTranscriptLoading}
      transcriptError={YTBTranscriptError}
    />
  ) : (
    <ManualTranscriptView />
  );
  // return <ManualTranscriptView />;
}
