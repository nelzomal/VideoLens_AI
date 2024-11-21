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
  const [text, setText] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    if (!inputText.trim()) return null;

    const videoId = getVideoId();
    if (!videoId) return null;

    // Check cache first
    const cached = await getCachedSummaryAsync(videoId);
    if (cached) {
      if (sections) {
        const sectionIndex = cached.sections.findIndex(
          (cachedSection) =>
            JSON.stringify(cachedSection) === JSON.stringify(sections[0])
        );
        if (sectionIndex !== -1 && cached.sectionSummaries[sectionIndex]) {
          return cached.sectionSummaries[sectionIndex];
        }
      }
    }

    setIsLoading(true);
    setSummary(null);
    try {
      const desiredChunkSize = Math.min(
        MAX_SUMMARY_INPUT_TOKENS * 0.9,
        Math.ceil(inputText.length / 5)
      );
      const chunks = splitIntoChunks(inputText, desiredChunkSize);
      const totalChunks = chunks.length;

      const summaries: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const result = await retryOperation(async () => {
          return await summarizeText(chunks[i], undefined, (loaded, total) => {
            const chunkProgress =
              (i * 100 + (loaded / total) * 100) / totalChunks;
            setProgress({
              loaded: Math.round(chunkProgress),
              total: 100,
            });
          });
        });
        if (result) {
          summaries.push(result);
        }
      }

      if (summaries.length === 0) return null;

      const finalSummary =
        summaries.length === 1
          ? summaries[0]
          : await retryOperation(() => summarizeText(summaries.join("\n\n")));

      setSummary(finalSummary);

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
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    text,
    setText,
    summary,
    isLoading,
    progress,
    handleSummarize,
    getCachedSummary: getCachedSummaryAsync,
    getVideoId,
    storeSummary,
  };
}
