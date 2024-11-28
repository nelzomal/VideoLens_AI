import { EmbeddingData } from "@/entrypoints/content/types/rag";
import { TranscriptEntry } from "@/entrypoints/content/types/transcript";

import { pipeline } from "@xenova/transformers";

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

let extractorInstance: any = null;
let isInitializing = false;

export async function initializeExtractor() {
  if (!extractorInstance && !isInitializing) {
    isInitializing = true;
    console.log("Initializing extractor");
    extractorInstance = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("Extractor initialized");
    isInitializing = false;
  }
  return extractorInstance;
}

async function getEmbedding(text: string): Promise<number[]> {
  const extractorInstance = await initializeExtractor();
  const result = (await extractorInstance(text, {
    pooling: "mean",
    normalize: true,
  })) as unknown as { data: Float32Array }[];
  return Array.from(result[0].data);
}

export const getEmbeddings = async (
  transcripts: TranscriptEntry[]
): Promise<EmbeddingData[]> => {
  const embeddings = await Promise.all(
    transcripts.map(async (transcript, index) => ({
      index,
      embedding: await getEmbedding(transcript.text),
      transcript: transcript.text,
    }))
  );

  return embeddings;
};

async function getSimilarity(embedding1: number[], embedding2: number[]) {
  return cosineSimilarity(embedding1, embedding2);
}

export async function getSimilarityBetweenEmbeddings(
  embedding: number[],
  embeddings: {
    index: number;
    embedding: Promise<number[]>;
    transcript: string;
  }[]
): Promise<
  {
    index: number;
    embedding: Promise<number[]>;
    transcript: string;
    similarity: number;
  }[]
> {
  // Calculate similarity scores for all embeddings
  const similarityScores = await Promise.all(
    embeddings.map(async (e) => ({
      ...e,
      similarity: await getSimilarity(embedding, await e.embedding),
    }))
  );

  // Sort by similarity score in descending order and get top 5
  return similarityScores
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}
