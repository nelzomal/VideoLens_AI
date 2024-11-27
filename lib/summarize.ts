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
  options?: AISummarizerCreateOptions
): Promise<string | null> {
  console.log("[summarizeText] Starting summarization", {
    textLength: text.length,
    estimatedTokens: estimateTokens(text),
    options,
  });

  const summarizer = await createSummarizer(options);

  if (!summarizer) {
    console.warn("[summarizeText] Failed to create summarizer");
    return null;
  }

  console.log("[summarizeText] Successfully created summarizer");

  try {
    console.log("[summarizeText] Attempting to summarize text");
    const result = await summarizer.summarize(text);
    console.log("[summarizeText] Summarization complete", {
      resultLength: result?.length,
      success: !!result,
    });
    return result;
  } catch (error) {
    console.error("[summarizeText] Error during summarization:", error);
    throw error;
  } finally {
    console.log("[summarizeText] Cleaning up summarizer");
    summarizer.destroy();
  }
}
