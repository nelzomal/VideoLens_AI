import { useState, useEffect, useCallback } from "react";
import { checkVideoStatus, sendMessageToBackground } from "../lib/utils";
import { TranscriptEntry } from "../types/transcript";
import { useVideoId } from "./useVideoId";
import {
  getStoredTranscript,
  storeTranscript,
  storeIsYTBTranscript,
} from "@/lib/storage";

export function useWhisperModel({
  setRecordingStatus,
}: {
  setRecordingStatus: (
    status: "loading" | "recording" | "stopped" | "no_video" | "idle"
  ) => void;
}) {
  const [isWhisperModelReady, setIsWhisperModelReady] = useState(false);
  const [isCheckingModels, setIsCheckingModels] = useState<boolean | string>(
    true
  );

  const [progressItems, setProgressItems] = useState<
    Array<Background.ModelFileProgressItem>
  >([]);
  const [transcripts, setTranscripts] = useState<Array<TranscriptEntry>>([]);

  // Add new state for video ID
  const videoId = useVideoId();

  // Modified useEffect for URL changes
  useEffect(() => {
    if (videoId) {
      storeIsYTBTranscript(videoId, false);
      const storedTranscript = getStoredTranscript(videoId);
      if (storedTranscript) {
        setTranscripts(storedTranscript);
      }
    }
  }, [videoId]);

  useEffect(() => {
    sendMessageToBackground({ action: "checkModelsLoaded" });
  }, []);

  // Modified effect for handling messages
  useEffect(() => {
    const handleResponse = (messageFromBg: Background.MessageToContent) => {
      if (messageFromBg.status === "completeChunk") {
        const isVideoPlaying = checkVideoStatus();

        setTranscripts((prev) => {
          const newTranscripts = [...prev, ...messageFromBg.data.chunks];
          // Save to localStorage when new chunks arrive
          if (videoId) {
            storeTranscript(videoId, newTranscripts);
          }
          return newTranscripts;
        });

        if (!isVideoPlaying) {
          sendMessageToBackground({ action: "stopCaptureBackground" });
          setRecordingStatus("stopped");
        }
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
  }, [videoId]);

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
