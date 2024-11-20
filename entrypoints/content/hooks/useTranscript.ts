import { useState, useCallback, useEffect } from "react";
import { TranscriptEntry } from "@/entrypoints/content/types/transcript";
import {
  getCurrentVideoId,
  getYouTubeTranscript,
} from "@/entrypoints/content/lib/utils";

export function useTranscript() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  const loadTranscript = async () => {
    console.log("Loading transcript...");
    setIsTranscriptLoading(true);
    setTranscriptError(null);

    try {
      const entries = await getYouTubeTranscript();
      console.log("Received transcript entries:", entries);

      if (entries.length === 0) {
        setTranscriptError(
          "No transcript found. Make sure you're on a YouTube video page with available transcripts."
        );
      } else {
        setTranscript(entries);
      }
    } catch (error) {
      console.error("Error loading transcript:", error);
      setTranscriptError(
        "Failed to load transcript: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsTranscriptLoading(false);
    }
  };

  useEffect(() => {
    const checkAndLoadTranscript = async () => {
      const videoId = getCurrentVideoId();
      if (videoId && videoId !== currentVideoId) {
        setCurrentVideoId(videoId);
        await loadTranscript();
      }
    };

    checkAndLoadTranscript();
  }, [currentVideoId]);

  const handleTranscriptClick = (timestamp: number) => {
    const video = document.querySelector("video");
    if (video) {
      video.currentTime = timestamp;
    }
  };

  return {
    transcript,
    isTranscriptLoading,
    transcriptError,
    loadTranscript,
    handleTranscriptClick,
  };
}
