import {
  checkVideoStatus,
  sendMessageToBackground,
} from "@/entrypoints/content/lib/utils";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Language } from "@/lib/constants";
import { RecordingStatus } from "@/entrypoints/content/types/transcript";

export function Recording({
  language,
  recordingStatus,
  setRecordingStatus,
}: {
  language: Language;
  recordingStatus: RecordingStatus;
  setRecordingStatus: (status: RecordingStatus) => void;
}) {
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
        language,
      });
    } else {
      setRecordingStatus("no_video");
    }
  }, [sendMessageToBackground, checkVideoStatus, getVideoTimestamp, language]);

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
        <Button
          variant="mui-contained"
          className="shadow-sm"
        >
          Loading
        </Button>
      ) : recordingStatus === "recording" ? (
        <Button
          variant="mui-contained"
          onClick={stopRecording}
          className="shadow-sm"
        >
          Stop Transcribe
        </Button>
      ) : (
        <Button
          variant="mui-contained"
          onClick={recordTabAudio}
          className="shadow-sm"
        >
          Transcribe
        </Button>
      )}
      {recordingStatus === "no_video" && (
        <p className="text-sm text-gray-600">No video playing</p>
      )}
    </div>
  );
}
