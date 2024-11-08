import AudioStreamManager from "@/lib/AudioStreamManager";
import { INJECTED_COMPONENT_ID, WHISPER_SAMPLING_RATE } from "@/lib/constants";
import { createRoot } from "react-dom/client";
import { useState, useCallback, useRef, useEffect } from "react";
import "./style.css";
import { ScrollArea } from "@/components/ui/scroll-area";

const IS_WEBGPU_AVAILABLE = "gpu" in window.navigator && !!window.navigator.gpu;

// React component for injected content
export const InjectedComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [chunks, setChunks] = useState<Array<Blob>>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [isWhisperModelReady, setIsWhisperModelReady] = useState(false);
  const [isCheckingModels, setIsCheckingModels] = useState<boolean>(true);
  const [transcripts, setTranscripts] = useState<string[]>([]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamManagerRef = useRef<AudioStreamManager | null>(null);

  const sendMessageToBackground = useCallback(
    (message: MainPage.MessageToBackground) => {
      browser.runtime.sendMessage({ ...message, source: "inject" });
    },
    []
  );

  const recordTabAudio = useCallback(() => {
    audioStreamManagerRef.current = new AudioStreamManager();
    sendMessageToBackground({ action: "captureBackground" });
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

  // check if the model files have been downloaded
  useEffect(() => {
    sendMessageToBackground({ action: "checkModelsLoaded" });
  }, [sendMessageToBackground]);

  useEffect(() => () => stopRecording(), [stopRecording]);

  useEffect(() => {
    const handleResponse = (
      messageFromBg: Background.MessageFromBackground
    ) => {
      // Handle responses from the background script
      console.log("inject: handleResponse from background ", messageFromBg);
      if (messageFromBg.status === "captureContent") {
        startRecording(messageFromBg.data);
      } else if (messageFromBg.status === "completeChunk") {
        console.log("popup: ", messageFromBg.data);
        setTranscripts(messageFromBg.data.chunks);
      } else if (messageFromBg.status === "modelsLoaded") {
        setIsCheckingModels(false);
        setIsWhisperModelReady(messageFromBg.result);
      }
    };
    browser.runtime.onMessage.addListener(handleResponse);

    return () => {
      browser.runtime.onMessage.removeListener(handleResponse);
    };
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
          chromeMediaSourceId: streamId,
        },
      },
    });
    // Continue to play the captured audio to the user.
    audioContextRef.current = new AudioContext({
      sampleRate: WHISPER_SAMPLING_RATE,
    });
    const source = audioContextRef.current.createMediaStreamSource(media);
    source.connect(audioContextRef.current.destination);

    // Start recording.
    recorderRef.current = new MediaRecorder(media, { mimeType: "audio/mp3" });
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
              const serializedAudioData = Array.from(audioChunk);
              sendMessageToBackground({
                data: serializedAudioData,
                action: "transcribe",
                language: selectedLanguage,
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

  const recordUI = useCallback(() => {
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
  }, [isRecording]);

  const notSupportedUI = () => {
    return (
      <div className="fixed w-screen h-screen bg-black z-10 bg-opacity-[92%] text-white text-2xl font-semibold flex justify-center items-center text-center">
        WebGPU is not supported
        <br />
        by this browser :&#40;
      </div>
    );
  };

  return IS_WEBGPU_AVAILABLE ? (
    <div className="min-w-64 min-h-32 p-4 bg-white">
      <div className="flex flex-col items-center justify-between mb-4 ">
        <div className="w-full mb-4">
          <LanguageSelector
            value={selectedLanguage}
            onChange={setSelectedLanguage}
          />
        </div>

        {isWhisperModelReady ? (
          recordUI()
        ) : (
          <div className="w-full text-center">
            {isCheckingModels ? (
              <div className="animate-pulse text-gray-600">
                Checking model status...
              </div>
            ) : (
              "Need to load models"
            )}
          </div>
        )}
        {transcripts.length > 0 && (
          <>
            <div className="flex-none p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Transcript</h2>
            </div>
            <ScrollArea className="flex-grow">
              <div className="p-4 space-y-4">
                {transcripts.map(
                  (entry, index) => (
                    console.log("entry: ", index, entry),
                    (
                      <div key={index} className="space-y-1">
                        <div className="font-medium text-primary">
                          <p className="text-red-500">{entry}</p>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  ) : (
    notSupportedUI()
  );
};

// Wait for the container to be created by the content script
const waitForContainer = () => {
  return new Promise<HTMLElement>((resolve) => {
    const check = () => {
      const container = document.querySelector(INJECTED_COMPONENT_ID);
      if (container) {
        resolve(container as HTMLElement);
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
};

export default defineUnlistedScript(async () => {
  const container = await waitForContainer();
  const root = createRoot(container);
  root.render(<InjectedComponent />);
});
