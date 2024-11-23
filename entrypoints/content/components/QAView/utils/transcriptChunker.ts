import { MAX_TRANSCRIPT_LENGTH } from "@/lib/constants";

export function chunkTranscript(transcriptText: string): string[] {
  if (transcriptText.length <= MAX_TRANSCRIPT_LENGTH) {
    return [transcriptText];
  }

  const sentences = transcriptText.split(/[.!?]+\s+/);
  const chunks: string[] = [];
  let currentChunk = "";
  let lastSentence = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > MAX_TRANSCRIPT_LENGTH) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = lastSentence + sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
    lastSentence = sentence;
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export function selectRandomChunks(chunks: string[], count: number): string[] {
  const shuffledChunks = [...chunks].sort(() => Math.random() - 0.5);
  return shuffledChunks.slice(0, Math.min(count, shuffledChunks.length));
}
