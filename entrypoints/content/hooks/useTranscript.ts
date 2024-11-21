import { useState, useCallback, useEffect } from "react";
import { TranscriptEntry } from "@/entrypoints/content/types/transcript";
import {
  getCurrentVideoId,
  getYouTubeTranscript,
} from "@/entrypoints/content/lib/utils";

export function useTranscript() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const resetTranscript = useCallback(() => {
    setTranscript([]);
    setTranscriptError(null);
    setIsTranscriptLoading(false);
  }, []);

  const loadTranscript = async () => {
    setIsTranscriptLoading(true);
    setTranscriptError(null);

    try {
      const entries = await getYouTubeTranscript();
      if (entries.length === 0) {
        setTranscriptError(
          "No transcript found. Make sure you're on a YouTube video page with available transcripts."
        );
      } else {
        setTranscript(entries);
      }
    } catch (error) {
      setTranscriptError(
        "Failed to load transcript: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsTranscriptLoading(false);
    }
  };

  return {
    transcript,
    isTranscriptLoading,
    transcriptError,
    loadTranscript,
    resetTranscript,
  };
}
