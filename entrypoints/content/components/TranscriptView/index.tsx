import { useEffect } from "react";
import { useYTBTranscript } from "../../hooks/useYTBTranscript";
import { ManualTranscriptView } from "./ManualTranscriptView";
import { AutoTranscriptView } from "./AutoTranscriptView";

export function TranscriptView() {
  const {
    YTBTranscript,
    isYTBTranscriptLoading,
    YTBTranscriptError,
    loadYTBTranscript,
  } = useYTBTranscript();

  useEffect(() => {
    loadYTBTranscript();
  }, []);

  if (isYTBTranscriptLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          Loading transcript...
        </div>
      </div>
    );
  }

  return YTBTranscript.length > 0 && YTBTranscriptError === null ? (
    <AutoTranscriptView
      YTBTranscript={YTBTranscript}
      isTranscriptLoading={isYTBTranscriptLoading}
      transcriptError={YTBTranscriptError}
    />
  ) : (
    <ManualTranscriptView />
  );
  // return <ManualTranscriptView />;
}
