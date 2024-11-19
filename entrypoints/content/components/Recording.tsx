import React, { useState, useCallback, useEffect } from "react";
import type { ReactElement } from "react";
import { sendMessageToBackground } from "../lib/utils";

export function Recording() {
  const [recordingStatus, setRecordingStatus] = useState<
    "loading" | "recording" | "stopped"
  >("stopped");

  const checkVideoStatus = useCallback(() => {
    const videoElement = document.querySelector("video");
    if (videoElement) {
      return !videoElement.paused && !videoElement.ended;
    }
    return false;
  }, []);

  const getVideoTimestamp = useCallback(() => {
    const videoElement = document.querySelector("video");
    if (videoElement) {
      return videoElement.currentTime;
    }
    return null;
  }, []);

  const recordTabAudio = useCallback(() => {
    const isPlaying = checkVideoStatus();
    const recordStartTimeInSeconds = getVideoTimestamp();

    setRecordingStatus("loading");

    if (isPlaying && recordStartTimeInSeconds) {
      sendMessageToBackground({
        action: "captureBackground",
        recordStartTimeInSeconds,
      });
      setRecordingStatus("recording");
    }
  }, [sendMessageToBackground, checkVideoStatus, getVideoTimestamp]);

  const stopRecording = useCallback(() => {
    sendMessageToBackground({ action: "stopCaptureBackground" });
    setRecordingStatus("stopped");
  }, [sendMessageToBackground]);

  useEffect(() => {
    return () => {
      if (recordingStatus === "recording") {
        stopRecording();
      }
    };
  }, [stopRecording, recordingStatus]);

  useEffect(() => {
    const handleRecordingState = (message: any) => {
      if (message.action === "recordingStarted") {
        setRecordingStatus("recording");
      } else if (message.action === "recordingStopped") {
        setRecordingStatus("stopped");
      }
    };

    chrome.runtime.onMessage.addListener(handleRecordingState);

    return () => {
      chrome.runtime.onMessage.removeListener(handleRecordingState);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-between">
      {recordingStatus === "loading" ? (
        "Loading"
      ) : recordingStatus === "recording" ? (
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
          onClick={stopRecording}
        >
          Stop Record
        </button>
      ) : (
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
          onClick={recordTabAudio}
        >
          Record
        </button>
      )}
    </div>
  );
}
