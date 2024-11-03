import React from "react";
import { match } from "ts-pattern";
import { WHISPER_SAMPLING_RATE } from "@/lib/constants";

const IS_WEBGPU_AVAILABLE = "gpu" in navigator && !!navigator.gpu;

const sendMessageToBackground = browser.runtime
  .sendMessage<MainPage.MessageToBackground>;

class AudioStreamManager {
  private audioBuffer: Float32Array;
  private lastProcessedIndex: number;

  constructor() {
    this.audioBuffer = new Float32Array(0);
    this.lastProcessedIndex = 0;
  }

  addAudio(newAudio: Float32Array) {
    const audioLength = newAudio.length;
    console.log("add audio:", audioLength, this.lastProcessedIndex);
    if (audioLength > this.lastProcessedIndex) {
      try {
        const newBuffer = new Float32Array(
          audioLength - this.lastProcessedIndex
        );
        // Append new audio to buffer
        newBuffer.set(newAudio.slice(this.lastProcessedIndex));
        this.audioBuffer = newBuffer;
        this.lastProcessedIndex = audioLength;
      } catch (err) {
        console.log("add audio:", err);
      }
    }

    return this.audioBuffer;
  }

  clear() {
    this.audioBuffer = new Float32Array(0);
    this.lastProcessedIndex = 0;
  }
}

const App = () => {
  const [transcript, setTranscript] = useState<Array<string>>([]);

  // whisper model
  const [isWhisperModelReady, setIsWhisperModelReady] = useState(false);
  const isLoadingWhisperRef = useRef(false);

  // conifg
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  // TODO check if need tab, isValidUrl
  // const [isValidUrl, setIsValidUrl] = useState(true);
  // const [tab, setTab] = useState<MainPage.ChromeTab | null>(null)

  // record
  const [isRecording, setIsRecording] = useState(false);
  const [chunks, setChunks] = useState<Array<Blob>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamManagerRef = useRef<AudioStreamManager | null>(null);

  useEffect(() => {
    if (!isWhisperModelReady && !isLoadingWhisperRef.current) {
      isLoadingWhisperRef.current = true;
      sendMessageToBackground({ action: "loadWhisperModel" });
    }

    const receiveMessageFromBackground = (
      messageFromBg: Background.MessageFromBackground
    ) => {
      match(messageFromBg)
        .with({ status: "modelsLoaded" }, () => {
          setIsWhisperModelReady(true);
        })
        .with({ status: "captureContent" }, ({ data: streamId }) => {
          console.log("receive streamId:", streamId);
          startRecording(streamId);
        })
        .with({ status: "completeChunk" }, ({ data }) => {
          console.log("data.chunks: ", data.chunks);
          setTranscript(data.chunks);
        });
    };

    browser.runtime.onMessage.addListener(receiveMessageFromBackground);
  }, []);

  const recordTabAudio = useCallback(() => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab) {
        audioStreamManagerRef.current = new AudioStreamManager();
        console.log("captureBackground: ", tab);
        sendMessageToBackground({ action: "captureBackground", tab });
      }
    });
  }, []);

  const startRecording = useCallback(async (streamId: string) => {
    if (recorderRef.current?.state === "recording") {
      throw new Error("Called startRecording while recording is in progress.");
    }

    const media = await navigator.mediaDevices.getUserMedia({
      audio: {
        // TODO linter mediaDevices.getUserMedia error
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId
        }
      }
    });
    // Continue to play the captured audio to the user.
    audioContextRef.current = new AudioContext({
      sampleRate: WHISPER_SAMPLING_RATE
    });
    const source = audioContextRef.current.createMediaStreamSource(media);
    source.connect(audioContextRef.current.destination);

    // Start recording.
    recorderRef.current = new MediaRecorder(media, { mimeType: "audio/webm" });
    recorderRef.current.onstart = () => {
      setIsRecording(true);
      setChunks([]);
    };

    recorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setChunks((prev) => [...prev, event.data]);
      } else {
        // Empty chunk received, so we request new data after a short timeout
        setTimeout(() => {
          recorderRef.current?.requestData();
        }, 25);
      }
    };
    recorderRef.current.onstop = () => {
      console.log("stop");
      setIsRecording(false);
    };

    // NOTE: interval 3s
    // TODO improve the chunking logic
    recorderRef.current.start(3000);
  }, []);

  // TODO check and improve stop recording logic
  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current?.stop();
      // Stopping the tracks makes sure the recording icon in the tab is removed.
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    }

    audioStreamManagerRef.current?.clear();
    recorderRef.current = null;
    setChunks([]);
  }, []);

  useEffect(() => {
    if (!recorderRef.current) return;
    if (!isRecording) return;

    if (chunks.length > 0 && audioContextRef.current) {
      // Generate from data
      const blob = new Blob(chunks, { type: recorderRef.current.mimeType });

      const fileReader = new FileReader();

      fileReader.onloadend = async () => {
        const arrayBuffer = fileReader.result;
        if (arrayBuffer) {
          const decoded = await audioContextRef.current?.decodeAudioData(
            arrayBuffer as ArrayBuffer
          );
          if (decoded) {
            const audio = decoded.getChannelData(0);
            const audioChunk = audioStreamManagerRef.current?.addAudio(audio);
            if (audioChunk) {
              console.log("audioChunk", audioChunk.length);
              const serializedAudioData = Array.from(audioChunk);
              sendMessageToBackground({
                data: serializedAudioData,
                action: "transcribe",
                language: selectedLanguage
              });
            }
          }
        }
      };

      fileReader.readAsArrayBuffer(blob);
    } else {
      recorderRef.current?.requestData();
    }
  }, [isRecording, chunks, selectedLanguage]);

  // UI
  const recordUI = () => {
    return (
      <div className="flex flex-col items-center justify-between mb-4">
        Model files loaded
        {isRecording ? (
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 my-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
            onClick={() => stopRecording()}
          >
            Stop Record
          </button>
        ) : (
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 my-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
            onClick={() => recordTabAudio()}
          >
            Record
          </button>
        )}
      </div>
    );
  };

  const supportedUI = () => {
    return (
      <>
        {isWhisperModelReady ? (
          recordUI()
        ) : (
          <div className="animate-pulse text-gray-600">
            Checking model status...
          </div>
        )}
      </>
    );
  };

  const notSupportedUI = () => {
    return (
      <div className="fixed w-screen h-screen bg-black z-10 bg-opacity-[92%] text-white text-2xl font-semibold flex justify-center items-center text-center">
        WebGPU is not supported
        <br />
        by this browser :&#40;
      </div>
    );
  };

  return IS_WEBGPU_AVAILABLE ? supportedUI() : notSupportedUI();
};

export default App;
