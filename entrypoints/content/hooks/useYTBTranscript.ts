import { useState, useCallback } from "react";
import { TranscriptEntry } from "@/entrypoints/content/types/transcript";
import { getYouTubeTranscript } from "@/entrypoints/content/lib/utils";
import { getStoredTranscript, storeTranscript } from "@/lib/storage";
import { useVideoId } from "../hooks/useVideoId";

export function useYTBTranscript() {
  const [YTBTranscript, setYTBTranscript] = useState<TranscriptEntry[]>([]);
  const [isYTBTranscriptLoading, setIsYTBTranscriptLoading] = useState(false);
  const [YTBTranscriptError, setYTBTranscriptError] = useState<string | null>(
    null
  );
  const videoId = useVideoId();

  const loadYTBTranscript = async () => {
    if (!videoId) {
      return;
    }
    const cachedTranscript = getStoredTranscript(videoId);
    if (cachedTranscript && cachedTranscript.length > 0) {
      setYTBTranscript(cachedTranscript);
      setIsYTBTranscriptLoading(false);
      return;
    }
    setIsYTBTranscriptLoading(true);
    setYTBTranscriptError(null);

    try {
      const entries = await getYouTubeTranscript();
      if (entries.length === 0) {
        setYTBTranscriptError(
          "No transcript found. Make sure you're on a YouTube video page with available transcripts."
        );
      } else {
        setYTBTranscript(entries);
        if (videoId) {
          storeTranscript(videoId, entries);
          setIsYTBTranscriptLoading(false);
        }
      }
    } catch (error) {
      setYTBTranscriptError(
        "Failed to load transcript: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsYTBTranscriptLoading(false);
    }
  };

  return {
    YTBTranscript,
    isYTBTranscriptLoading,
    YTBTranscriptError,
    loadYTBTranscript,
  };
}
