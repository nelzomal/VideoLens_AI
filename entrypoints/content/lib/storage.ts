import { TranscriptEntry } from "../types/transcript";

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
  videoId: string,
  translations: TranscriptEntry[]
) => {
  const key = getStorageKey("translation", videoId);
  storeData(key, translations);
};

export const getStoredTranslation = (
  videoId: string
): TranscriptEntry[] | null => {
  const key = getStorageKey("translation", videoId);
  return getData<TranscriptEntry[]>(key);
};
