import { useState, useEffect } from "react";
import { TranscriptEntry } from "../types/transcript";
import { translateMultipleTexts } from "../lib/translate";
import { getCurrentVideoId } from "../lib/utils";

// Cache expiration time - 7 days
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

interface StoredTranslation {
  translations: TranscriptEntry[];
  timestamp: number;
}

export function useTranslate(transcript: TranscriptEntry[]) {
  const [translatedTranscript, setTranslatedTranscript] = useState<
    TranscriptEntry[]
  >([]);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    async function translateTranscript() {
      if (transcript.length === 0) {
        setTranslatedTranscript([]);
        return;
      }

      const currentVideoId = getCurrentVideoId();
      if (!currentVideoId) return;

      // Check cache
      try {
        const cached = localStorage.getItem(`translation_${currentVideoId}`);
        if (cached) {
          const parsedCache = JSON.parse(cached) as StoredTranslation;
          if (Date.now() - parsedCache.timestamp <= CACHE_EXPIRATION) {
            setTranslatedTranscript(parsedCache.translations);
            return;
          }
          localStorage.removeItem(`translation_${currentVideoId}`);
        }
      } catch (error) {
        console.error("Error reading translation cache:", error);
      }

      // Translate if no cache found
      setIsTranslating(true);
      setTranslatedTranscript(
        transcript.map((entry) => ({ ...entry, translation: null }))
      );

      try {
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

        // Store in cache
        try {
          localStorage.setItem(
            `translation_${currentVideoId}`,
            JSON.stringify({
              translations: translatedTranscript,
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.error("Error storing translation cache:", error);
        }
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
