import { useState, useEffect } from "react";
import { TranscriptEntry } from "../types/transcript";
import { translateMultipleTexts } from "../lib/translate";
import { getCurrentVideoId } from "../lib/utils";

export interface TranslatedEntry extends TranscriptEntry {
  translation: string | null;
}

// Cache expiration time - 7 days (matching useSummarize.ts)
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

interface StoredTranslation {
  translations: TranslatedEntry[];
  timestamp: number;
}

export function useTranslate(transcript: TranscriptEntry[]) {
  const [translatedTranscript, setTranslatedTranscript] = useState<
    TranslatedEntry[]
  >([]);
  const [isTranslating, setIsTranslating] = useState(false);

  const getCachedTranslationAsync = async (
    videoId: string
  ): Promise<TranslatedEntry[] | null> => {
    try {
      const cached = localStorage.getItem(`translation_${videoId}`);
      if (!cached) return null;

      const parsedCache = JSON.parse(cached) as StoredTranslation;

      if (Date.now() - parsedCache.timestamp > CACHE_EXPIRATION) {
        localStorage.removeItem(`translation_${videoId}`);
        return null;
      }

      await new Promise((resolve) => setTimeout(resolve, 0));
      return parsedCache.translations;
    } catch (error) {
      console.error("Error reading translation cache:", error);
      return null;
    }
  };

  const storeTranslation = (
    videoId: string,
    translations: TranslatedEntry[]
  ) => {
    try {
      const dataToStore: StoredTranslation = {
        translations,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `translation_${videoId}`,
        JSON.stringify(dataToStore)
      );
    } catch (error) {
      console.error("Error storing translation cache:", error);
    }
  };

  useEffect(() => {
    async function translateTranscript() {
      if (transcript.length === 0) {
        setTranslatedTranscript([]);
        return;
      }

      const currentVideoId = getCurrentVideoId();
      if (!currentVideoId) return;

      // Check localStorage cache first
      const cachedTranslations = await getCachedTranslationAsync(
        currentVideoId
      );
      if (cachedTranslations) {
        console.log(
          "[useTranslate] Using cached translation from localStorage"
        );
        setTranslatedTranscript(cachedTranslations);
        return;
      }

      setIsTranslating(true);

      // Initialize translated transcript with null translations
      setTranslatedTranscript(
        transcript.map((entry) => ({ ...entry, translation: null }))
      );

      try {
        // Translate each line individually
        for (let i = 0; i < transcript.length; i++) {
          const translation = await translateMultipleTexts(
            [transcript[i].text],
            "en",
            "zh"
          );

          setTranslatedTranscript((prev) => {
            const updated = [...prev];
            updated[i] = {
              ...transcript[i],
              translation: translation[0],
            };
            return updated;
          });
        }

        // Store in localStorage cache
        setTranslatedTranscript((prev) => {
          storeTranslation(currentVideoId, prev);
          return prev;
        });
      } catch (error) {
        console.error("[useTranslate] Translation error:", error);
      } finally {
        setIsTranslating(false);
      }
    }

    translateTranscript();
  }, [transcript]);

  return {
    translatedTranscript,
    isTranslating,
  };
}
