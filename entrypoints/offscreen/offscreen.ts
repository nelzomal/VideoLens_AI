import AudioStreamManager from "@/lib/AudioStreamManager";
import { WHISPER_SAMPLING_RATE } from "@/lib/constants";

let recorderRef: MediaRecorder | null = null;
let audioContextRef: AudioContext | null = null;
let audioStreamManagerRef: AudioStreamManager | null = null;
let chunks: Array<Blob> = [];
let isRecording = false;
let activeTab: MainPage.ChromeTab | null = null;

browser.runtime.onMessage.addListener(handleMessages);

const sendMessageToBackground = (message: Offscreen.MessageToBackground) => {
  browser.runtime.sendMessage(message);
};

async function handleMessages(message: Background.MessageToOffscreen) {
  if (message?.target !== "offscreen" || !message?.action) {
    return;
  }

  if (message.tab) {
    activeTab = message.tab;
  }

  if (message.action === "captureContent") {
    cleanup(); // Cleanup before starting new recording
    audioStreamManagerRef = new AudioStreamManager();
    startRecording(message?.data ?? "");
  } else if (message.action === "stopCaptureContent") {
    stopRecording();
  }
}

const startRecording = async (streamId: string) => {
  if (recorderRef?.state === "recording") {
    throw new Error("Called startRecording while recording is in progress.");
  }

  try {
    const media = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          // Fix the type by using proper Chrome extension audio constraints
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      },
    });

    // Continue to play the captured audio to the user.
    audioContextRef = new AudioContext({
      sampleRate: WHISPER_SAMPLING_RATE,
    });
    const source = audioContextRef.createMediaStreamSource(media);
    source.connect(audioContextRef.destination);

    // Start recording.
    recorderRef = new MediaRecorder(media, { mimeType: "audio/webm" });
    recorderRef.onstart = () => {
      isRecording = true;
      sendMessageToBackground({
        action: "beginRecording",
        target: "background",
      });
      chunks = [];
    };

    recorderRef.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks = [...chunks, event.data];
        transcribeAudio();
      } else {
        // Empty chunk received, so we request new data after a short timeout
        setTimeout(() => {
          recorderRef?.requestData();
        }, 25);
      }
    };
    recorderRef.onstop = () => {
      console.log("stop");
      isRecording = false;
    };

    // NOTE: interval 3s
    // TODO improve the chunking logic
    recorderRef.start(3000);
  } catch (error) {
    console.error("Error starting recording: ", error);
    cleanup(); // Cleanup on error
  }
};

const transcribeAudio = async () => {
  if (chunks.length > 0 && audioContextRef && recorderRef) {
    // Generate from data
    const blob = new Blob(chunks, { type: recorderRef.mimeType });

    const fileReader = new FileReader();

    fileReader.onloadend = async () => {
      const arrayBuffer = fileReader.result;
      if (arrayBuffer) {
        try {
          const decoded = await audioContextRef?.decodeAudioData(
            arrayBuffer as ArrayBuffer
          );
          if (decoded) {
            const audio = decoded.getChannelData(0);
            const audioChunk = audioStreamManagerRef?.addAudio(audio);
            if (audioChunk) {
              const serializedAudioData = Array.from(audioChunk);
              sendMessageToBackground({
                data: serializedAudioData,
                action: "transcribe",
                target: "background",
                // TODO: get the language from the tab
                language: "english",
                // language: selectedLanguage,
              });
            }
          }
        } catch (err) {
          console.error("Error decoding audio:", err);
        }
      }
    };

    fileReader.onerror = () => {
      console.error("FileReader error:", fileReader.error);
      fileReader.abort();
    };

    fileReader.readAsArrayBuffer(blob);
  } else {
    recorderRef?.requestData();
  }
};

const cleanup = () => {
  // Stop and cleanup recorder
  if (recorderRef?.state === "recording") {
    recorderRef.stop();
    recorderRef.stream.getTracks().forEach((t) => t.stop());
  }
  recorderRef = null;

  // Close audio context
  if (audioContextRef?.state !== "closed") {
    audioContextRef?.close();
  }
  audioContextRef = null;

  // Clear audio stream manager
  if (audioStreamManagerRef) {
    audioStreamManagerRef.clear();
    audioStreamManagerRef = null;
  }

  // Clear chunks array
  chunks = [];
  isRecording = false;
};

const stopRecording = () => {
  cleanup();
};

// Cleanup when offscreen document is closed
window.addEventListener("unload", cleanup);
