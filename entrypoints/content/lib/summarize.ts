import { estimateTokens } from "./ai";

/**
 * Creates and initializes a summarizer session with progress monitoring
 */
export async function createSummarizer(
  options?: AISummarizerCreateOptions,
  onProgress?: (loaded: number, total: number) => void
): Promise<AISummarizerSession | null> {
  const capabilities = await ai.summarizer?.capabilities();

  if (!capabilities || capabilities.available === "no") {
    return null;
  }

  const summarizer = await ai.summarizer?.create(options);

  if (!summarizer) {
    return null;
  }

  if (capabilities.available === "after-download" && onProgress) {
    summarizer.addEventListener(
      "downloadprogress",
      (e: AIDownloadProgressEvent) => {
        onProgress(e.loaded, e.total);
      }
    );
    await summarizer.ready;
  }

  return summarizer;
}

/**
 * Checks if summarization capabilities are available
 */
export async function checkSummarizerCapabilities(): Promise<AISummarizerCapabilities | null> {
  return (await ai.summarizer?.capabilities()) || null;
}

/**
 * Summarizes the given text and handles cleanup
 */
export async function summarizeText(
  text: string,
  options?: AISummarizerCreateOptions,
  onProgress?: (loaded: number, total: number) => void
): Promise<string | null> {
  const summarizer = await createSummarizer(options, onProgress);

  if (!summarizer) {
    return null;
  }

  try {
    const result = await summarizer.summarize(text);
    return result;
  } finally {
    summarizer.destroy();
  }
}
