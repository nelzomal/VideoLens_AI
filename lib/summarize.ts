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
  options: AISummarizerCreateOptions = {
    length: "short",
    type: "key-points",
    format: "plain-text",
    sharedContext:
      "You are an assistant that summarizes video transcripts. Keep the summary concise and to the point.",
  }
): Promise<string | null> {
  console.info("[summarizeText] Starting summarization", {
    textLength: text.length,
    estimatedTokens: estimateTokens(text),
    options,
  });

  const summarizer = await createSummarizer(options);
  console.log("[summarizeText] summarizer", summarizer);

  if (!summarizer) {
    console.warn("[summarizeText] Failed to create summarizer");
    return null;
  }

  console.info("[summarizeText] Successfully created summarizer");

  try {
    console.info("[summarizeText] Attempting to summarize text");
    const result = await summarizer.summarize(text);
    console.info("[summarizeText] Summarization complete", {
      resultLength: result?.length,
      success: !!result,
    });
    return result;
  } catch (error) {
    console.error("[summarizeText] Error during summarization:", error);
    throw error;
  } finally {
    console.info("[summarizeText] Cleaning up summarizer");
    summarizer.destroy();
  }
}
