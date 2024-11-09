import { useCallback, useEffect, useRef, useState } from "react";
import LanguageSelector from "@/components/ui/LanguageSelector";
import Progress from "@/components/ui/Progress";
import { WHISPER_SAMPLING_RATE } from "@/lib/constants";
import "../style.css";
import AudioStreamManager from "../../lib/AudioStreamManager";

const IS_WEBGPU_AVAILABLE = "gpu" in navigator && !!navigator.gpu;

const sendMessageToBackground = browser.runtime
  .sendMessage<MainPage.MessageToBackground>;

const App = () => {
  const [transcript, setTranscript] = useState<Array<string>>([]);

  // whisper model
  const [progressItems, setProgressItems] = useState<
    Array<Background.ModelFileProgressItem>
  >([]);
  const [isWhisperModelReady, setIsWhisperModelReady] = useState(false);
  const [isCheckingModels, setIsCheckingModels] = useState<string | boolean>(
    true
  );

  // conifg
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  // TODO check if need tab, isValidUrl

  // record
  const [isRecording, setIsRecording] = useState(false);
  const [chunks, setChunks] = useState<Array<Blob>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamManagerRef = useRef<AudioStreamManager | null>(null);

  const recordTabAudio = useCallback(() => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab) {
        audioStreamManagerRef.current = new AudioStreamManager();
        sendMessageToBackground({ action: "captureBackground" });
      }
    });
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
    console.log("popup checkModelsLoaded");
    sendMessageToBackground({ action: "checkModelsLoaded" });
  }, []);

  // when the page unmount, stop the capture
  useEffect(() => () => stopRecording(), [stopRecording]);

  useEffect(() => {
    const receiveMessageFromBackground = (
      messageFromBg: Background.MessageToInject
    ) => {
      console.log("popup messageFromBg", messageFromBg);
      if (messageFromBg.status === "captureContent") {
        startRecording(messageFromBg.data);
      } else if (messageFromBg.status === "startAgain") {
        recorderRef.current?.requestData();
        // } else if (messageFromBg.status === "completeChunk") {
        //   console.log("popup: ", messageFromBg.data);
        //   setTranscript(messageFromBg.data.chunks);
      } else if (messageFromBg.status === "modelsLoaded") {
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

    browser.runtime.onMessage.addListener(receiveMessageFromBackground);

    return () => {
      browser.runtime.onMessage.removeListener(receiveMessageFromBackground);
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

    console.log("popup startRecording", media);

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
        console.log("popup ondataavailable", event.data);
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
    console.log("popup startRecording start");
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

  // UI
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
                {isCheckingModels !== true
                  ? isCheckingModels
                  : "Checking model status..."}
              </div>
            ) : (
              <button
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
                onClick={() =>
                  sendMessageToBackground({ action: "loadWhisperModel" })
                }
              >
                Load Models
              </button>
            )}
          </div>
        )}
        {progressItems.length > 0 && (
          <div className="relative z-10 p-4 w-full text-center">
            {/* <VerticalBar /> */}
            <label>Loading model files... (only run once)</label>
            {progressItems.map((data) => (
              <div key={data.file}>
                <Progress text={data.file} percentage={data.progress} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : (
    notSupportedUI()
  );
};

export default App;
