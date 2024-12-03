import { useState, useEffect, useCallback, useRef } from "react";
import { TranscriptEntry } from "../../../types/transcript";
import { useVideoId } from "@/entrypoints/content/hooks/useVideoId";
import { getStoredTranslation, storeTranslation } from "@/lib/storage";
import { translateMultipleTexts } from "@/lib/translate";
import { Language } from "@/lib/constants";
import { getLanguageCode } from "@/entrypoints/content/lib/utils";

export function useTranslate({
  transcripts,
  isLive,
  sourceLanguage,
  targetLanguage,
  translateEnabled,
}: {
  sourceLanguage: Language;
  transcripts: TranscriptEntry[];
  isLive: boolean;
  targetLanguage: Language | null;
  translateEnabled: boolean;
}) {
  const [translatedTranscript, setTranslatedTranscript] = useState<
    TranscriptEntry[]
  >([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslationDone, setIsTranslationDone] = useState(false);
  const videoId = useVideoId();
  const lastProcessedIndex = useRef(-1);
  const previousTargetLanguage = useRef(targetLanguage);

  const resetTranslation = useCallback(() => {
    setTranslatedTranscript([]);
    setIsTranslating(false);
    setIsTranslationDone(false);
    lastProcessedIndex.current = -1;
  }, []);

  useEffect(() => {
    // Store translations when all are done (for non-live mode)
    if (
      !isLive &&
      isTranslationDone &&
      translatedTranscript.length > 0 &&
      videoId &&
      targetLanguage
    ) {
      storeTranslation({
        key: videoId,
        sourceLanguage,
        targetLanguage,
        translations: translatedTranscript,
      });
    }
  }, [
    isTranslationDone,
    translatedTranscript,
    isLive,
    videoId,
    sourceLanguage,
    targetLanguage,
  ]);

  useEffect(() => {
    async function translateTranscript() {
      if (transcripts.length === 0) {
        resetTranslation();
        return;
      }

      if (!videoId || !targetLanguage) return;

      if (!translateEnabled) {
        setTranslatedTranscript(transcripts);
        setIsTranslationDone(true);
        return;
      }

      // Handle cached translations
      if (!isLive) {
        const cachedTranslations = getStoredTranslation({
          key: videoId,
          sourceLanguage,
          targetLanguage,
        });

        if (
          cachedTranslations &&
          Array.isArray(cachedTranslations) &&
          cachedTranslations.length > 0
        ) {
          setTranslatedTranscript(cachedTranslations);
          setIsTranslationDone(true);
          return;
        }
      }

      const targetLanguageChanged =
        previousTargetLanguage.current !== targetLanguage;
      previousTargetLanguage.current = targetLanguage;

      // Only process new entries
      // if the target language is not the same as the previous one, we will translate all the entries again
      const newEntries = targetLanguageChanged
        ? [...transcripts]
        : transcripts.slice(lastProcessedIndex.current + 1);
      if (newEntries.length === 0) return;

      setIsTranslating(true);

      try {
        // Translate new entries one by one
        for (let i = 0; i < newEntries.length; i++) {
          const translation = await translateMultipleTexts(
            [newEntries[i].text],
            getLanguageCode(sourceLanguage),
            getLanguageCode(targetLanguage)
          );

          if (targetLanguageChanged) {
            newEntries[i].translation = translation[0];
            setTranslatedTranscript(newEntries);
            if (isLive && videoId) {
              storeTranslation({
                key: videoId,
                sourceLanguage,
                targetLanguage,
                translations: newEntries,
              });
            }
          } else {
            setTranslatedTranscript((prev) => {
              const currentIndex = prev.length + i;
              const updated = [...prev];
              updated[currentIndex] = {
                ...newEntries[i],
                translation: translation[0],
              };
              lastProcessedIndex.current = currentIndex;

              const filtered = updated.filter((v) => v);

              // Store translation after each entry only in live mode
              if (isLive && videoId) {
                storeTranslation({
                  key: videoId,
                  sourceLanguage,
                  targetLanguage,
                  translations: filtered,
                });
              }

              return filtered;
            });
          }
        }

        lastProcessedIndex.current = transcripts.length - 1;
        setIsTranslationDone(true);
      } catch (error) {
        console.error("[useTranslate] Translation error:", error);
        setIsTranslationDone(false);
      } finally {
        setIsTranslating(false);
      }
    }

    translateTranscript();
  }, [transcripts, videoId, isLive, sourceLanguage, targetLanguage]);

  return {
    translatedTranscript,
    isTranslating,
    isTranslationDone,
    resetTranslation,
  };
}
