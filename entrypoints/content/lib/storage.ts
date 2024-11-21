const getTranscriptKey = (videoId: string) => `video_transcript_${videoId}`;

interface StoredTranscript {
  transcripts: Array<{ time: number; text: string }>;
  timestamp: number;
}

export const saveTranscript = (
  videoId: string,
  transcripts: Array<{ time: number; text: string }>
) => {
  try {
    const key = getTranscriptKey(videoId);
    const data: StoredTranscript = {
      transcripts,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving transcript:", error);
  }
};

export const getStoredTranscript = (
  videoId: string
): Array<{ time: number; text: string }> | null => {
  try {
    const key = getTranscriptKey(videoId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const data: StoredTranscript = JSON.parse(stored);
    return data.transcripts;
  } catch (error) {
    console.error("Error loading transcript:", error);
    return null;
  }
};
