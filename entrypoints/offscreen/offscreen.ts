import AudioStreamManager from "@/lib/AudioStreamManager";
import { WHISPER_SAMPLING_RATE } from "@/lib/constants";

let recorderRef: MediaRecorder | null = null;
let audioContextRef: AudioContext | null = null;
let audioStreamManagerRef: AudioStreamManager | null = null;
let chunks: Array<Blob> = [];
let isRecording = false;
let activeTab: MainPage.ChromeTab | null = null;

console.log("offscreen: loaded");

browser.runtime.onMessage.addListener(handleMessages);

async function handleMessages(message: Background.MessageToOffscreen) {
  console.log("offscreen: handleMessages", message);
  if (message?.target !== "offscreen" || !message?.action) {
    return;
  }

  if (message.tab) {
    activeTab = message.tab;
  }

  if (message.action === "captureContent") {
    audioStreamManagerRef = new AudioStreamManager();
    startRecording(message.data);
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
        transcribeAudio(recorderRef!);
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
  }
};

const transcribeAudio = async (recorderRef: MediaRecorder) => {
  if (chunks.length > 0 && audioContextRef) {
    // Generate from data
    const blob = new Blob(chunks, { type: recorderRef.mimeType });

    const fileReader = new FileReader();

    fileReader.onloadend = async () => {
      const arrayBuffer = fileReader.result;
      if (arrayBuffer) {
        const decoded = await audioContextRef?.decodeAudioData(
          arrayBuffer as ArrayBuffer
        );
        if (decoded) {
          console.log("offscreen: transcribeAudio decoded", decoded.length);
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
      }
    };

    fileReader.readAsArrayBuffer(blob);
  } else {
    recorderRef?.requestData();
  }
};

const sendMessageToBackground = (message: Offscreen.MessageToBackground) => {
  browser.runtime.sendMessage(message);
};

const stopRecording = () => {
  if (recorderRef?.state === "recording") {
    recorderRef?.stop();
    // Stopping the tracks makes sure the recording icon in the tab is removed.
    recorderRef?.stream.getTracks().forEach((t) => t.stop());
  }

  audioStreamManagerRef?.clear();
  recorderRef = null;
  chunks = [];
};
