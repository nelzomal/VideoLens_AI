import { TranscriptEntry } from "@/entrypoints/content/types/transcript";
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

export const removeTranscriptData = (videoId: string) => {
  const transcriptKey = getStorageKey("transcript", videoId);
  const translationKey = getStorageKey("translation", videoId);
  const isYTBTranscriptKey = getStorageKey("isYTBTranscript", videoId);
  try {
    localStorage.removeItem(transcriptKey);
    localStorage.removeItem(translationKey);
    localStorage.removeItem(isYTBTranscriptKey);
  } catch (error) {
    console.error("Error removing transcript data:", error);
  }
};
