import { useState, useEffect, useCallback } from "react";
import { sendMessageToBackground } from "../lib/utils";
import { getStoredTranscript, storeTranscript } from "../lib/storage";
import { TranscriptEntry } from "../types/transcript";
import { useVideoId } from "./useVideoId";

export function useWhisperModel() {
  const [isWhisperModelReady, setIsWhisperModelReady] = useState(false);
  const [isCheckingModels, setIsCheckingModels] = useState<boolean | string>(
    true
  );

  const [progressItems, setProgressItems] = useState<
    Array<Background.ModelFileProgressItem>
  >([]);
  const [transcripts, setTranscripts] = useState<Array<TranscriptEntry>>([]);

  // Add new state for video ID
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const videoId = useVideoId();

  // Modified useEffect for URL changes
  useEffect(() => {
    setCurrentVideoId(videoId);

    if (videoId) {
      const storedTranscript = getStoredTranscript(videoId);
      if (storedTranscript) {
        setTranscripts(storedTranscript);
      } else {
        setTranscripts([]);
      }
    }
  }, [window.location.href]);

  useEffect(() => {
    sendMessageToBackground({ action: "checkModelsLoaded" });
  }, []);

  // Modified effect for handling messages
  useEffect(() => {
    const handleResponse = (messageFromBg: Background.MessageToContent) => {
      if (messageFromBg.status === "completeChunk") {
        setTranscripts((prev) => {
          const newTranscripts = [...prev, ...messageFromBg.data.chunks];
          // Save to localStorage when new chunks arrive
          if (currentVideoId) {
            storeTranscript(currentVideoId, newTranscripts);
          }
          return newTranscripts;
        });
      } else if (messageFromBg.status === "modelsLoaded") {
        // model files loaded
        setIsCheckingModels(false);
        setIsWhisperModelReady(messageFromBg.result);
      } else if (messageFromBg.status === "initiate") {
        setProgressItems((prev) => [...prev, messageFromBg]);
      } else if (messageFromBg.status === "progress") {
        setProgressItems((prev) =>
          prev.map((item) => {
            if (item.file === messageFromBg.file) {
              return {
                ...item,
                progress: messageFromBg.progress,
                file: messageFromBg.file,
              };
            }
            return item;
          })
        );
      } else if (messageFromBg.status === "done") {
        setProgressItems((prev) =>
          prev.filter((item) => item.file !== messageFromBg.file)
        );
      } else if (messageFromBg.status === "loading") {
        setIsCheckingModels(messageFromBg.msg);
      } else if (messageFromBg.status === "ready") {
        setIsWhisperModelReady(true);
      }
    };

    browser.runtime.onMessage.addListener(handleResponse);

    return () => {
      browser.runtime.onMessage.removeListener(handleResponse);
    };
  }, [currentVideoId]);

  const resetTranscripts = useCallback(() => {
    setTranscripts([]);
  }, []);

  return {
    isWhisperModelReady,
    isCheckingModels,
    progressItems,
    transcripts,
    setTranscripts,
    resetTranscripts,
  };
}
