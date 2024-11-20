import { useState } from "react";
import { summarizeText } from "@/entrypoints/content/lib/summarize";
import { splitIntoChunks } from "@/entrypoints/content/lib/ai";
import { MAX_SUMMARY_INPUT_TOKENS } from "@/lib/constants";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

  const handleSummarize = async (inputText: string): Promise<string | null> => {
    if (!inputText.trim()) return null;

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
  };
}
