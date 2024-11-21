import { useTranscript } from "./useTranscript";
import { useEffect, useState } from "react";
import { TranscriptEntry } from "../types/transcript";

const TRANSCRIPT_CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface StoredTranscript {
  transcript: TranscriptEntry[];
  timestamp: number;
}

export function usePersistedTranscript() {
  const {
    transcript: originalTranscript,
    isTranscriptLoading: isApiTranscriptLoading,
    transcriptError,
    loadTranscript,
  } = useTranscript();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(true);

  const getVideoId = (): string | null => {
    const url = window.location.href;
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  const getCachedTranscript = (videoId: string): TranscriptEntry[] | null => {
    try {
      const cached = localStorage.getItem(`transcript_${videoId}`);
      if (!cached) return null;

      const parsedCache = JSON.parse(cached) as StoredTranscript;

      if (Date.now() - parsedCache.timestamp > TRANSCRIPT_CACHE_EXPIRATION) {
        localStorage.removeItem(`transcript_${videoId}`);
        return null;
      }

      return parsedCache.transcript;
    } catch (error) {
      console.error("Error reading transcript cache:", error);
      return null;
    }
  };

  const storeTranscript = (videoId: string, transcript: TranscriptEntry[]) => {
    try {
      const dataToStore: StoredTranscript = {
        transcript,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `transcript_${videoId}`,
        JSON.stringify(dataToStore)
      );
    } catch (error) {
      console.error("Error storing transcript cache:", error);
    }
  };

  useEffect(() => {
    const videoId = getVideoId();
    if (!videoId) {
      setIsLoadingFromCache(false);
      return;
    }

    // Try to load from cache first
    const cachedTranscript = getCachedTranscript(videoId);
    if (cachedTranscript && cachedTranscript.length > 0) {
      setTranscript(cachedTranscript);
      setIsLoadingFromCache(false);
    } else {
      // If not in cache, load from API
      loadTranscript();
      setIsLoadingFromCache(false);
    }
  }, []);

  // Store new transcript in cache when it's loaded
  useEffect(() => {
    if (originalTranscript.length > 0) {
      const videoId = getVideoId();
      if (videoId) {
        storeTranscript(videoId, originalTranscript);
        setTranscript(originalTranscript);
      }
    }
  }, [originalTranscript]);

  const isTranscriptLoading = isLoadingFromCache || isApiTranscriptLoading;

  return {
    transcript,
    isTranscriptLoading,
    transcriptError,
    loadTranscript,
  };
}
