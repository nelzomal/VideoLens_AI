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
  // Estimate tokens (roughly 4 characters per token)
  const estimatedTokens = estimateTokens(text);
  console.log(`Estimated tokens for text: ${estimatedTokens}`);

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

/**
 * Summarizes multiple texts in sequence, creating a new summarizer instance for each text
 * due to current limitations requiring resource cleanup between summarizations
 */
export async function summarizeMultipleTexts(
  texts: string[],
  options?: AISummarizerCreateOptions,
  onProgress?: (loaded: number, total: number) => void
): Promise<(string | null)[]> {
  // Estimate total tokens for all texts
  const totalEstimatedTokens = texts.reduce(
    (acc, text) => acc + Math.ceil(text.length / 4),
    0
  );
  console.log(
    `Estimated total tokens for ${texts.length} texts: ${totalEstimatedTokens}`
  );

  const results = [];

  for (const text of texts) {
    const estimatedTokens = Math.ceil(text.length / 4);
    console.log(`Estimated tokens for current text: ${estimatedTokens}`);

    const summarizer = await createSummarizer(options, onProgress);

    if (!summarizer) {
      results.push(null);
      continue;
    }

    try {
      const summary = await summarizer.summarize(text);
      results.push(summary);
    } finally {
      summarizer.destroy();
    }
  }

  return results;
}
