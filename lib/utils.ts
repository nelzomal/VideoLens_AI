import { TranscriptEntry } from "@/entrypoints/content/types/transcript";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatChunksWithTimestamps(outputText: string[]) {
  const timestamps: { time: string; text: string }[] = [];
  const matches = outputText[0].match(/<\|(\d+\.\d+)\|>([^<]*)/g) || [];

  // First pass: collect all valid timestamps and their text
  matches.forEach((match) => {
    const [_, time, text] = match.match(/<\|(\d+\.\d+)\|>(.*)/) || [];
    if (time) {
      timestamps.push({ time, text });
    }
  });

  const result: [string, string][] = [];
  let currentChunk: {
    startTime: string;
    text: string;
    endTime: string;
  } | null = null;

  for (let i = 0; i < timestamps.length; i++) {
    const current = timestamps[i];
    const next = timestamps[i + 1];

    if (!currentChunk) {
      // Start a new chunk
      if (current.text.trim() || (next && current.time === next.time)) {
        currentChunk = {
          startTime: current.time,
          text: current.text,
          endTime: next ? next.time : current.time,
        };
      }
      continue;
    }

    if (current.time === timestamps[i - 1].time) {
      // Merge text for same timestamp
      currentChunk.text += current.text;
      if (next) {
        currentChunk.endTime = next.time;
      }
    } else {
      // Complete current chunk and start a new one if needed
      if (currentChunk.text.trim()) {
        result.push([
          `${currentChunk.startTime} - ${currentChunk.endTime}`,
          currentChunk.text,
        ]);
      }

      if (current.text.trim() || (next && current.time === next.time)) {
        currentChunk = {
          startTime: current.time,
          text: current.text,
          endTime: next ? next.time : current.time,
        };
      } else {
        currentChunk = null;
      }
    }
  }

  // Add the last chunk if it exists
  if (currentChunk && currentChunk.text.trim()) {
    result.push([
      `${currentChunk.startTime} - ${currentChunk.endTime}`,
      currentChunk.text,
    ]);
  }

  return result.reduce((acc: [string, string][], curr, idx) => {
    if (acc.length === 0) return [curr];

    const last = acc[acc.length - 1];
    const [lastRange, lastText] = last;
    const [currRange, currText] = curr;
    const [_, lastEnd] = lastRange.split(" - ");
    const [currStart, currEnd] = currRange.split(" - ");

    if (lastEnd === currStart) {
      // Merge chunks
      acc[acc.length - 1] = [
        `${lastRange.split(" - ")[0]} - ${currEnd}`,
        lastText + currText,
      ];
    } else {
      acc.push(curr);
    }

    return acc;
  }, []);
}

export function appendAbsoluteTimeToChunks(
  chunks: Array<[string, string]>,
  transcriptStartTimeInSec: number
) {
  const chunksWithAbsoluteTime: Array<TranscriptEntry> = [];
  for (const chunk of chunks) {
    const duration = chunk[0];
    const startEndTimeArray = duration.split(" - ");
    if (startEndTimeArray.length === 2) {
      const startTime = parseFloat(startEndTimeArray[0]);

      const absoluteStartTimeInSec = transcriptStartTimeInSec + startTime;
      chunksWithAbsoluteTime.push({
        start: absoluteStartTimeInSec,
        text: chunk[1],
      });
    }
  }

  return chunksWithAbsoluteTime;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 5,
  delayMs = 10
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      console.error(`Retry attempt ${attempt} failed:`, err);
      if (attempt === maxRetries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("All retry attempts failed");
}
