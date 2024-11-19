import { useState, useEffect } from "react";
import { sendMessageToBackground } from "../lib/utils";

export function useWhisperModel() {
  const [isWhisperModelReady, setIsWhisperModelReady] = useState(false);
  const [isCheckingModels, setIsCheckingModels] = useState<boolean | string>(
    true
  );
  const [progressItems, setProgressItems] = useState<
    Array<Background.ModelFileProgressItem>
  >([]);
  const [transcripts, setTranscripts] = useState<Array<[string, string]>>([]);

  // check if models are loaded when on mount
  useEffect(() => {
    sendMessageToBackground({ action: "checkModelsLoaded" });
  }, []);

  useEffect(() => {
    const handleResponse = (messageFromBg: Background.MessageToContent) => {
      if (messageFromBg.status === "completeChunk") {
        setTranscripts((prev) => [...prev, ...messageFromBg.data.chunks]);
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
  }, []);

  return {
    isWhisperModelReady,
    isCheckingModels,
    progressItems,
    transcripts,
    setTranscripts,
  };
}
