import { useYTBTranscript } from "./useYTBTranscript";
import { useEffect, useState } from "react";
import { TranscriptEntry } from "../types/transcript";
import { useVideoId } from "./useVideoId";
import {
  getStoredTranscript,
  storeTranscript,
  removeTranscriptData,
  getStoredTranslation,
} from "@/lib/storage";

export function usePersistedTranscript() {
  const {
    YTBTranscript: originalTranscript,
    isYTBTranscriptLoading: isApiTranscriptLoading,
    YTBTranscriptError,
    loadYTBTranscript,
  } = useYTBTranscript();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(true);

  const videoId = useVideoId();

  useEffect(() => {
    if (!videoId) {
      setIsLoadingFromCache(false);
      return;
    }

    // Try to load from cache first
    const cachedTranscript = getStoredTranscript(videoId);
    if (cachedTranscript && cachedTranscript.length > 0) {
      setTranscript(cachedTranscript);
      setIsLoadingFromCache(false);
    } else {
      loadYTBTranscript();
      setIsLoadingFromCache(false);
    }
  }, [videoId]);

  // Store new transcript in cache when it's loaded
  useEffect(() => {
    if (originalTranscript.length > 0) {
      if (videoId) {
        // Store the transcript as-is since it already matches the TranscriptEntry type
        storeTranscript(videoId, originalTranscript);
        setTranscript(originalTranscript);
      }
    }
  }, [originalTranscript]);

  const isTranscriptLoading = isLoadingFromCache || isApiTranscriptLoading;

  const clearCache = () => {
    if (videoId) {
      logCache();
      removeTranscriptData(videoId);
      logCache();
      setTranscript([]);
      loadYTBTranscript(); // Reload transcript from API
    }
  };

  const logCache = () => {
    if (videoId) {
      const currentTranscriptCache = getStoredTranscript(videoId);
      const currentTranslationCache = getStoredTranslation(videoId);
      console.log("Current transcript cache:", currentTranscriptCache);
      console.log("Current translation cache:", currentTranslationCache);
    } else {
      console.log("No video ID available");
    }
  };

  return {
    transcript,
    isTranscriptLoading,
    YTBTranscriptError,
    loadYTBTranscript,
    clearCache,
    logCache,
  };
}
