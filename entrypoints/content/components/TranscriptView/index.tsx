import { useState, useEffect } from "react";
import { useWhisperModel } from "../../hooks/useWhisperModel";
import { useUrlChange } from "../../hooks/useUrlChange";
import { useVideoId } from "../../hooks/useVideoId";
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

  // try to load the youtube transcript when the component is mounted
  useEffect(() => {
    loadYTBTranscript();
  }, []);

  if (isYTBTranscriptLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading transcript...</div>
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
}
