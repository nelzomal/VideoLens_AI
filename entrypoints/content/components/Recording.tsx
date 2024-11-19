import React, { useState, useCallback, useEffect } from "react";
import type { ReactElement } from "react";
import { sendMessageToBackground } from "../lib/utils";

export function Recording() {
  const [recordingStatus, setRecordingStatus] = useState<
    "loading" | "recording" | "stopped" | "no_video" | "idle"
  >("idle");

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

    if (isPlaying && recordStartTimeInSeconds) {
      setRecordingStatus("loading");
      sendMessageToBackground({
        action: "captureBackground",
        recordStartTimeInSeconds,
      });
    } else {
      setRecordingStatus("no_video");
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
    const handleRecordingState = (message: Background.MessageToContent) => {
      if (message.status === "recordingStarted") {
        setRecordingStatus("recording");
      }
    };

    chrome.runtime.onMessage.addListener(handleRecordingState);

    return () => {
      chrome.runtime.onMessage.removeListener(handleRecordingState);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-between gap-2">
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
      {recordingStatus === "no_video" && (
        <p className="text-sm">No video playing</p>
      )}
    </div>
  );
}
