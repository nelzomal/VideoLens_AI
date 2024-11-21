import { useState, useCallback } from "react";
import { TranscriptEntry } from "../types/transcript";
import { getCurrentVideoId, getYouTubeTranscript } from "../lib/utils";

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
    console.log("Starting transcript load process...");
    const videoId = getCurrentVideoId();
    console.log("Current video ID:", videoId);

    if (!videoId) {
      console.warn("No video ID found, aborting transcript load");
      setTranscriptError("No video ID found");
      return;
    }

    // Check cache first
    try {
      const cached = localStorage.getItem(`transcript_${videoId}`);
      console.log(
        "Checking cache for video ID:",
        videoId,
        "Cache found:",
        !!cached
      );

      if (cached) {
        const parsedCache = JSON.parse(cached) as StoredTranscript;
        const cacheAge = Date.now() - parsedCache.timestamp;
        console.log(
          "Cache age:",
          cacheAge,
          "ms",
          "Cache expiration:",
          CACHE_EXPIRATION,
          "ms"
        );

        if (cacheAge <= CACHE_EXPIRATION) {
          console.log(
            "Using cached transcript, length:",
            parsedCache.transcript.length
          );
          setTranscript(parsedCache.transcript);
          setTranscriptError(null);
          return;
        }
        console.log("Cache expired, removing...");
        localStorage.removeItem(`transcript_${videoId}`);
      }
    } catch (error) {
      console.error("Error reading transcript cache:", error);
    }

    setIsTranscriptLoading(true);
    setTranscriptError(null);

    try {
      console.log("Fetching fresh transcript...");
      const transcript = await getYouTubeTranscript();
      console.log(
        "Transcript fetched successfully, length:",
        transcript.length
      );
      setTranscript(transcript);

      // Cache the transcript
      try {
        const cacheData = {
          transcript,
          timestamp: Date.now(),
        };
        localStorage.setItem(
          `transcript_${videoId}`,
          JSON.stringify(cacheData)
        );
        console.log("Transcript cached successfully");
      } catch (error) {
        console.error("Error storing transcript cache:", error);
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setTranscriptError(
        error instanceof Error ? error.message : "Unknown error"
      );
      setTranscript([]);
    } finally {
      setIsTranscriptLoading(false);
      console.log("Transcript loading process completed");
    }
  }, []);

  const resetTranscript = useCallback(() => {
    console.log("Resetting transcript state");
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
