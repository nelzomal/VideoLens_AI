import { checkSummarizerCapabilities } from "./summarize";

/**
 * Estimates the number of tokens in a string for LLM processing.
 * This is a rough approximation - actual tokens may vary by model.
 * Generally estimates 4 characters per token on average.
 */
export function estimateTokens(text: string): number {
  // Remove extra whitespace
  const cleanText = text.trim().replace(/\s+/g, " ");

  // Approximate tokens based on character count
  // Using 4 chars per token as a rough estimate
  const charCount = cleanText.length;
  const estimatedTokens = Math.ceil(charCount / 4);

  return estimatedTokens;
}

/**
 * Splits a long text into chunks, respecting sentence boundaries and token limits.
 * @param text The text to split
 * @param maxChunkSize Maximum tokens per chunk (default 1000)
 * @returns Array of text chunks
 */
export function splitIntoChunks(text: string, maxChunkSize: number): string[] {
  // First try to split by paragraphs
  let segments = text.split(/\n\s*\n/).filter((s) => s.trim());

  // If we don't have enough paragraphs, split by sentences
  if (segments.length < 5) {
    segments = text
      .replace(/([.!?])\s+/g, "$1\n") // Add newlines after sentence endings
      .split(/\n/)
      .filter((s) => s.trim());
  }

  // If still not enough segments, split by phrases
  if (segments.length < 5) {
    segments = text
      .replace(/([,;:])\s+/g, "$1\n") // Add newlines after phrase endings
      .split(/\n/)
      .filter((s) => s.trim());
  }

  // If we still don't have enough segments, force split by words
  if (segments.length < 5) {
    const words = text.split(/\s+/);
    const wordsPerSegment = Math.ceil(words.length / 5);
    segments = [];

    for (let i = 0; i < words.length; i += wordsPerSegment) {
      segments.push(words.slice(i, i + wordsPerSegment).join(" "));
    }
  }

  // Combine segments into 5 roughly equal chunks
  const targetChunks = 5;
  const segmentsPerChunk = Math.ceil(segments.length / targetChunks);
  const chunks: string[] = [];

  for (let i = 0; i < segments.length; i += segmentsPerChunk) {
    const chunkSegments = segments.slice(i, i + segmentsPerChunk);
    chunks.push(chunkSegments.join(" ").trim());
  }

  // If we somehow still don't have exactly 5 chunks, force split the longest ones
  while (chunks.length < targetChunks) {
    const longestChunkIndex = chunks
      .map((chunk, index) => ({ length: chunk.length, index }))
      .sort((a, b) => b.length - a.length)[0].index;

    const chunkToSplit = chunks[longestChunkIndex];
    const splitPoint = Math.ceil(chunkToSplit.length / 2);

    // Try to find a good split point near the middle
    let actualSplitPoint = splitPoint;
    const nearbySpace = chunkToSplit
      .slice(splitPoint - 20, splitPoint + 20)
      .indexOf(" ");

    if (nearbySpace !== -1) {
      actualSplitPoint = splitPoint - 20 + nearbySpace;
    }

    chunks[longestChunkIndex] = chunkToSplit.slice(0, actualSplitPoint).trim();
    chunks.splice(
      longestChunkIndex + 1,
      0,
      chunkToSplit.slice(actualSplitPoint).trim()
    );
  }

  // Ensure we have exactly 5 chunks by combining or splitting as needed
  while (chunks.length > targetChunks) {
    const shortestChunkIndex = chunks
      .map((chunk, index) => ({ length: chunk.length, index }))
      .sort((a, b) => a.length - b.length)[0].index;

    const nextChunkIndex =
      shortestChunkIndex === chunks.length - 1
        ? shortestChunkIndex - 1
        : shortestChunkIndex + 1;

    chunks[shortestChunkIndex] += " " + chunks[nextChunkIndex];
    chunks.splice(nextChunkIndex, 1);
  }

  return chunks;
}

export type AICapabilityCheckResult = {
  canTranslate: boolean;
  canSummarize: boolean;
  canPrompt: boolean;
};

export async function checkAICapabilities(): Promise<AICapabilityCheckResult> {
  let canTranslate = false;
  let canSummarize = false;
  let canPrompt = false;

  try {
    canTranslate =
      (await translation.canTranslate({
        targetLanguage: "en",
        sourceLanguage: "es",
      })) !== "no";
  } catch (error) {
    console.error("[checkAICapabilities] Translation check failed:", error);
  }

  try {
    const summarizeCapability = await checkSummarizerCapabilities();
    canSummarize =
      summarizeCapability !== null && summarizeCapability.available !== "no";
  } catch (error) {
    console.error("[checkAICapabilities] Summarizer check failed:", error);
  }

  try {
    canPrompt = (await ai.languageModel.capabilities()) !== null;
  } catch (error) {
    console.error("[checkAICapabilities] Language model check failed:", error);
  }

  console.log("[checkAICapabilities]: ", {
    canTranslate,
    canSummarize,
    canPrompt,
  });
  return { canTranslate, canSummarize, canPrompt };
}
