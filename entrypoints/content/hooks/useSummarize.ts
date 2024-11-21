import { useState, useEffect } from "react";
import { summarizeText } from "@/entrypoints/content/lib/summarize";
import { splitIntoChunks } from "@/entrypoints/content/lib/ai";
import { MAX_SUMMARY_INPUT_TOKENS } from "@/lib/constants";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface StoredSummary {
  sections: Array<Array<{ start: number; text: string }>>;
  sectionSummaries: { [key: number]: string };
  timestamp: number;
}

// Cache expiration time - 7 days
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

export function useSummarize() {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const retryOperation = async <T>(
    operation: () => Promise<T>,
    retries = MAX_RETRIES,
    delay = RETRY_DELAY
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await sleep(delay);
        return retryOperation(operation, retries - 1, delay * 1.5);
      }
      throw error;
    }
  };

  const getVideoId = (): string | null => {
    const url = window.location.href;
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  const getCachedSummaryAsync = async (
    videoId: string
  ): Promise<StoredSummary | null> => {
    try {
      const cached = localStorage.getItem(`summary_${videoId}`);
      if (!cached) return null;

      const parsedCache = JSON.parse(cached) as StoredSummary;

      if (Date.now() - parsedCache.timestamp > CACHE_EXPIRATION) {
        localStorage.removeItem(`summary_${videoId}`);
        return null;
      }

      await new Promise((resolve) => setTimeout(resolve, 0));
      return parsedCache;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  const storeSummary = (
    videoId: string,
    sections: Array<Array<{ start: number; text: string }>>,
    sectionSummaries: { [key: number]: string }
  ) => {
    try {
      const dataToStore: StoredSummary = {
        sections,
        sectionSummaries,
        timestamp: Date.now(),
      };
      localStorage.setItem(`summary_${videoId}`, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Error storing cache:", error);
    }
  };

  const handleSummarize = async (
    inputText: string,
    sections?: Array<Array<{ start: number; text: string }>>
  ): Promise<string | null> => {
    if (!inputText.trim() || isProcessing) {
      return null;
    }

    setIsProcessing(true);
    try {
      const videoId = getVideoId();
      if (!videoId) {
        return null;
      }

      setIsLoading(true);

      // Check cache first
      const cached = await getCachedSummaryAsync(videoId);
      if (cached && sections) {
        const sectionIndex = cached.sections.findIndex(
          (cachedSection) =>
            JSON.stringify(cachedSection) === JSON.stringify(sections[0])
        );
        if (sectionIndex !== -1 && cached.sectionSummaries[sectionIndex]) {
          return cached.sectionSummaries[sectionIndex];
        }
      }

      // Adjust threshold for chunking with a 20% buffer
      const CHARS_PER_TOKEN = 4;
      const BASE_THRESHOLD = MAX_SUMMARY_INPUT_TOKENS * CHARS_PER_TOKEN;
      const THRESHOLD_BUFFER = 0.2; // 20% buffer
      const CHUNK_THRESHOLD = BASE_THRESHOLD * (1 + THRESHOLD_BUFFER);

      let finalSummary: string | null;

      if (inputText.length > CHUNK_THRESHOLD) {
        // Only chunk if we're significantly over the threshold
        const numChunks = Math.ceil(inputText.length / BASE_THRESHOLD);
        const chunkSize = Math.ceil(inputText.length / numChunks);
        const chunks = splitIntoChunks(inputText, chunkSize);

        const summaries = await Promise.all(
          chunks.map((chunk) =>
            retryOperation(() =>
              summarizeText(chunk, undefined, (loaded, total) => {
                setProgress({ loaded, total });
              })
            )
          )
        );

        finalSummary =
          summaries.length === 1
            ? summaries[0]
            : await retryOperation(() => summarizeText(summaries.join("\n\n")));
      } else {
        finalSummary = await retryOperation(() =>
          summarizeText(inputText, undefined, (loaded, total) => {
            setProgress({ loaded, total });
          })
        );
      }

      // Store in cache if we're summarizing a section
      if (sections && finalSummary) {
        const existingCache = await getCachedSummaryAsync(videoId);
        const newCache: StoredSummary = existingCache || {
          sections: [],
          sectionSummaries: {},
          timestamp: Date.now(),
        };

        const sectionIndex = newCache.sections.length;
        newCache.sections.push(sections[0]);
        newCache.sectionSummaries[sectionIndex] = finalSummary;
        storeSummary(videoId, newCache.sections, newCache.sectionSummaries);
      }

      return finalSummary;
    } finally {
      setIsLoading(false);
      setProgress({ loaded: 0, total: 0 });
      setIsProcessing(false);
    }
  };

  const clearSummaryCache = () => {
    try {
      const keys = Object.keys(localStorage);
      let count = 0;
      keys.forEach((key) => {
        if (key.startsWith("summary_")) {
          localStorage.removeItem(key);
          count++;
        }
      });
      return count;
    } catch (error) {
      console.error("Error clearing summary cache:", error);
      return 0;
    }
  };

  return {
    isLoading,
    progress,
    handleSummarize,
    getCachedSummary: getCachedSummaryAsync,
    getVideoId,
    storeSummary,
    clearSummaryCache,
  };
}
