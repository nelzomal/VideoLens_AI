import { EmbeddingData } from "@/entrypoints/content/types/rag";
import { TranscriptEntry } from "@/entrypoints/content/types/transcript";
import { QAState } from "@/entrypoints/content/components/QAView/utils/qaSession";
import { INITIAL_QA_MESSAGE } from "@/lib/constants";
// Constants
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Types
interface StoredData<T> {
  data: T;
  timestamp: number;
}

// Key generators
const getStorageKey = (prefix: string, videoId: string) =>
  `${prefix}_${videoId}`;

// Generic storage functions
const storeData = <T>(key: string, data: T) => {
  try {
    const dataToStore: StoredData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(dataToStore));
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
  }
};

const getData = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const parsedData = JSON.parse(stored) as StoredData<T>;

    if (Date.now() - parsedData.timestamp > CACHE_EXPIRATION) {
      localStorage.removeItem(key);
      return null;
    }

    return parsedData.data;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return null;
  }
};

// Specific transcript storage functions
export const storeTranscript = (
  videoId: string,
  transcript: TranscriptEntry[]
) => {
  const key = getStorageKey("transcript", videoId);
  storeData(key, transcript);
};

export const getStoredTranscript = (
  videoId: string
): TranscriptEntry[] | null => {
  const key = getStorageKey("transcript", videoId);
  return getData<TranscriptEntry[]>(key);
};

export const storeTranslation = (
  key: string,
  translations: TranscriptEntry[]
) => {
  const storageKey = getStorageKey("translation", key);
  storeData(storageKey, translations);
};

export const getStoredTranslation = (key: string): TranscriptEntry[] | null => {
  const storageKey = getStorageKey("translation", key);
  return getData<TranscriptEntry[]>(storageKey);
};

export const storeIsYTBTranscript = (
  videoId: string,
  isYTBTranscript: boolean
) => {
  const key = getStorageKey("isYTBTranscript", videoId);
  storeData(key, isYTBTranscript);
};

export const getIsYTBTranscript = (videoId: string): boolean | null => {
  const key = getStorageKey("isYTBTranscript", videoId);
  return getData<boolean>(key);
};

// Add new storage functions for embeddings
export const storeEmbeddings = (
  videoId: string,
  embeddings: EmbeddingData[]
) => {
  const key = getStorageKey("embeddings", videoId);
  storeData(key, embeddings);
};

export const getStoredEmbeddings = (
  videoId: string
): EmbeddingData[] | null => {
  const key = getStorageKey("embeddings", videoId);
  return getData<EmbeddingData[]>(key);
};

export const logCachedData = (videoId: string) => {
  const currentTranscriptCache = getStoredTranscript(videoId!);
  const currentTranslationCache = getStoredTranslation(videoId!);
  const currentIsYTBTranscript = getIsYTBTranscript(videoId!);
  console.log("Current transcript cache:", currentTranscriptCache);
  console.log("Current translation cache:", currentTranslationCache);
  console.log("Current transcript type:", currentIsYTBTranscript);
  console.log("QA State:", getStoredQAState(videoId!));
  console.log("Embeddings:", getStoredEmbeddings(videoId!));
};

export const removeCachedData = (videoId: string) => {
  const transcriptKey = getStorageKey("transcript", videoId);
  const translationKey = getStorageKey("translation", videoId);
  const isYTBTranscriptKey = getStorageKey("isYTBTranscript", videoId);
  const embeddingsKey = getStorageKey("embeddings", videoId);
  const qaStateKey = getStorageKey("qa_state", videoId);
  try {
    localStorage.removeItem(transcriptKey);
    localStorage.removeItem(translationKey);
    localStorage.removeItem(isYTBTranscriptKey);
    localStorage.removeItem(embeddingsKey);
    localStorage.removeItem(qaStateKey);
  } catch (error) {
    console.error("Error removing transcript data:", error);
  }
};

// Add these functions to handle QA state storage
export const getStoredQAState = (videoId: string | null): QAState => {
  try {
    const key = getStorageKey("qa_state", videoId!);

    const stored = getData<QAState>(key);
    console.log("stored: ", key, stored);
    return stored || getInitialQAState();
  } catch {
    return getInitialQAState();
  }
};

export const storeQAState = (videoId: string, state: QAState) => {
  const key = getStorageKey("qa_state", videoId);
  storeData(key, state);
};

export const removeQAState = (videoId: string) => {
  const key = getStorageKey("qa_state", videoId);
  localStorage.removeItem(key);
};

// Helper function to get initial QA state
const getInitialQAState = (): QAState => ({
  messages: [INITIAL_QA_MESSAGE],
  questionCount: 0,
  singleChoiceCount: 0,
  prevQuestion: "",
  prevAnswer: "",
});
