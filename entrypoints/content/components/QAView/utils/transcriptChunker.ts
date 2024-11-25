import { MAX_TRANSCRIPT_LENGTH } from "@/lib/constants";

export function chunkTranscript(transcriptText: string): string[] {
  if (transcriptText.length <= MAX_TRANSCRIPT_LENGTH) {
    return [transcriptText];
  }

  // Calculate optimal number of chunks needed
  const numChunks = Math.ceil(transcriptText.length / MAX_TRANSCRIPT_LENGTH);
  const targetChunkSize = Math.ceil(transcriptText.length / numChunks);

  // First try to split by sentences
  const sentences = transcriptText.split(/[.!?]+\s+/);

  // If we don't have enough sentences, split by words
  if (sentences.length < numChunks * 2) {
    const words = transcriptText.split(/\s+/);
    const chunks: string[] = [];
    let currentChunk = "";
    const wordsPerChunk = Math.ceil(words.length / numChunks);

    words.forEach((word, index) => {
      if (
        index > 0 &&
        index % wordsPerChunk === 0 &&
        chunks.length < numChunks - 1
      ) {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        currentChunk += (currentChunk ? " " : "") + word;
      }
    });

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Sentence-based chunking with even distribution
  const chunks: string[] = [];
  let currentChunk = "";
  let currentLength = 0;

  for (const sentence of sentences) {
    const sentenceWithSpace = (currentChunk ? " " : "") + sentence;
    const newLength = currentLength + sentenceWithSpace.length;

    if (newLength > targetChunkSize && chunks.length < numChunks - 1) {
      chunks.push(currentChunk);
      currentChunk = sentence;
      currentLength = sentence.length;
    } else {
      currentChunk += sentenceWithSpace;
      currentLength = newLength;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
