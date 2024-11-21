import { useState, useCallback } from "react";
import { TranscriptEntry } from "../types/transcript";
import { getCurrentVideoId } from "../lib/utils";

// Cache expiration time - 7 days
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

interface StoredTranscript {
  transcript: TranscriptEntry[];
  timestamp: number;
}

export function useTranscript() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const loadTranscript = useCallback(async () => {
    const videoId = getCurrentVideoId();
    if (!videoId) {
      setTranscriptError("No video ID found");
      return;
    }

    // Check cache first
    try {
      const cached = localStorage.getItem(`transcript_${videoId}`);
      if (cached) {
        const parsedCache = JSON.parse(cached) as StoredTranscript;
        if (Date.now() - parsedCache.timestamp <= CACHE_EXPIRATION) {
          setTranscript(parsedCache.transcript);
          setTranscriptError(null);
          return;
        }
        localStorage.removeItem(`transcript_${videoId}`);
      }
    } catch (error) {
      console.error("Error reading transcript cache:", error);
    }

    setIsTranscriptLoading(true);
    setTranscriptError(null);

    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_TRANSCRIPT",
        videoId,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setTranscript(response.transcript);

      // Cache the transcript
      try {
        localStorage.setItem(
          `transcript_${videoId}`,
          JSON.stringify({
            transcript: response.transcript,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.error("Error storing transcript cache:", error);
      }
    } catch (error) {
      setTranscriptError(
        error instanceof Error ? error.message : "Unknown error"
      );
      setTranscript([]);
    } finally {
      setIsTranscriptLoading(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript([]);
    setTranscriptError(null);
  }, []);

  return {
    transcript,
    isTranscriptLoading,
    transcriptError,
    loadTranscript,
    resetTranscript,
  };
}
