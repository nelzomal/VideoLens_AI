import { useTranscript } from "./useTranscript";
import { useEffect, useState } from "react";
import { TranscriptEntry } from "../types/transcript";
import { getStoredTranscript, storeTranscript } from "../lib/storage";

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

  useEffect(() => {
    const videoId = getVideoId();
    if (!videoId) {
      setIsLoadingFromCache(false);
      return;
    }

    // Try to load from cache first
    const cachedTranscript = getStoredTranscript(videoId);
    if (cachedTranscript && cachedTranscript.length > 0) {
      // Convert cached transcript to match the expected type
      const convertedTranscript: TranscriptEntry[] = cachedTranscript.map(
        (entry) => ({
          start: entry.start,
          text: entry.text,
          translation: entry.translation,
        })
      );
      setTranscript(convertedTranscript);
      setIsLoadingFromCache(false);
    } else {
      loadTranscript();
      setIsLoadingFromCache(false);
    }
  }, []);

  // Store new transcript in cache when it's loaded
  useEffect(() => {
    if (originalTranscript.length > 0) {
      const videoId = getVideoId();
      if (videoId) {
        // Store the transcript as-is since it already matches the TranscriptEntry type
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
