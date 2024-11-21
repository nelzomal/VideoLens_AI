import { useState, useEffect } from "react";
import { TranscriptEntry } from "../types/transcript";
import { translateMultipleTexts } from "../lib/translate";
import { getCurrentVideoId } from "../lib/utils";

export interface TranslatedEntry extends TranscriptEntry {
  translation: string | null;
}

interface TranslationCache {
  [videoId: string]: TranslatedEntry[];
}

const globalTranslationCache: TranslationCache = {};

export function useTranslate(transcript: TranscriptEntry[]) {
  const [translatedTranscript, setTranslatedTranscript] = useState<
    TranslatedEntry[]
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

      // Check cache first
      if (globalTranslationCache[currentVideoId]) {
        console.log("[useTranslate] Using cached translation");
        setTranslatedTranscript(globalTranslationCache[currentVideoId]);
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

        // Cache the final result
        setTranslatedTranscript((prev) => {
          globalTranslationCache[currentVideoId] = prev;
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
