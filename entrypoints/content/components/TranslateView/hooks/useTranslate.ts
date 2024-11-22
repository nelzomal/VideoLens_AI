import { useState, useEffect, useCallback } from "react";
import { TranscriptEntry } from "../../../types/transcript";
import { translateMultipleTexts } from "../../../lib/translate";
import { getCurrentVideoId } from "../../../lib/utils";
import { getStoredTranslation, storeTranslation } from "../../../lib/storage";

export function useTranslate(transcript: TranscriptEntry[]) {
  const [translatedTranscript, setTranslatedTranscript] = useState<
    TranscriptEntry[]
  >([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslationDone, setIsTranslationDone] = useState(false);

  const resetTranslation = useCallback(() => {
    setTranslatedTranscript([]);
    setIsTranslating(false);
    setIsTranslationDone(false);
  }, []);

  useEffect(() => {
    async function translateTranscript() {
      if (transcript.length === 0) {
        setTranslatedTranscript([]);
        setIsTranslationDone(false);
        return;
      }

      const currentVideoId = getCurrentVideoId();
      if (!currentVideoId) return;

      const cachedTranslations = getStoredTranslation(currentVideoId);
      if (cachedTranslations) {
        console.log(
          "[useTranslate] Using cached translation from localStorage"
        );
        const convertedTranslations = cachedTranslations.map((entry) => ({
          start: entry.start,
          text: entry.text,
          translation: entry.translation,
        }));
        setTranslatedTranscript(convertedTranslations);
        setIsTranslationDone(true);
        return;
      }

      setIsTranslating(true);
      setIsTranslationDone(false);
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

        setTranslatedTranscript((prev) => {
          storeTranslation(currentVideoId, prev);
          return prev;
        });
        setIsTranslationDone(true);
      } catch (error) {
        console.error("[useTranslate] Translation error:", error);
        setIsTranslationDone(false);
      } finally {
        setIsTranslating(false);
      }
    }

    translateTranscript();
  }, [transcript]);

  return {
    translatedTranscript,
    isTranslating,
    isTranslationDone,
    resetTranslation,
  };
}
