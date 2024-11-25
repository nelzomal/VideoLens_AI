import { useState, useEffect, useCallback, useRef } from "react";
import { TranscriptEntry } from "../../../types/transcript";
import { translateMultipleTexts } from "../../../lib/translate";
import { getStoredTranslation, storeTranslation } from "../../../lib/storage";
import { useVideoId } from "@/entrypoints/content/hooks/useVideoId";

export function useTranslate({
  transcript,
  isLive,
}: {
  transcript: TranscriptEntry[];
  isLive: boolean;
}) {
  const [translatedTranscript, setTranslatedTranscript] = useState<
    TranscriptEntry[]
  >([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslationDone, setIsTranslationDone] = useState(false);
  const videoId = useVideoId();
  const lastProcessedIndex = useRef(-1);

  const resetTranslation = useCallback(() => {
    setTranslatedTranscript([]);
    setIsTranslating(false);
    setIsTranslationDone(false);
    lastProcessedIndex.current = -1;
  }, []);

  useEffect(() => {
    async function translateTranscript() {
      if (transcript.length === 0) {
        resetTranslation();
        return;
      }

      if (!videoId) return;

      // Handle cached translations
      if (!isLive) {
        const cachedTranslations = getStoredTranslation(videoId + "ytb");
        if (cachedTranslations) {
          console.info("[useTranslate] Using cached translation");
          const convertedTranslations = cachedTranslations.map((entry) => ({
            start: entry.start,
            text: entry.text,
            translation: entry.translation,
          }));
          setTranslatedTranscript(convertedTranslations);
          setIsTranslationDone(true);
          return;
        }
      }

      // Only process new entries
      const newEntries = transcript.slice(lastProcessedIndex.current + 1);
      if (newEntries.length === 0) return;

      setIsTranslating(true);

      try {
        // Add new entries without translation first
        setTranslatedTranscript((prev) => [
          ...prev,
          ...newEntries.map((entry) => ({ ...entry, translation: null })),
        ]);

        // Translate new entries one by one
        for (let i = 0; i < newEntries.length; i++) {
          const translation = await translateMultipleTexts(
            [newEntries[i].text],
            "en",
            "zh"
          );

          setTranslatedTranscript((prev) => {
            const currentIndex = lastProcessedIndex.current + 1 + i;
            const updated = [...prev];
            updated[currentIndex] = {
              ...updated[currentIndex],
              translation: translation[0],
            };
            return updated;
          });
        }

        lastProcessedIndex.current = transcript.length - 1;

        if (!isLive) {
          setTranslatedTranscript((prev) => {
            storeTranslation(videoId, prev);
            return prev;
          });
        }

        setIsTranslationDone(true);
      } catch (error) {
        console.error("[useTranslate] Translation error:", error);
        setIsTranslationDone(false);
      } finally {
        setIsTranslating(false);
      }
    }

    translateTranscript();
  }, [transcript, videoId, isLive]);

  return {
    translatedTranscript,
    isTranslating,
    isTranslationDone,
    resetTranslation,
  };
}
