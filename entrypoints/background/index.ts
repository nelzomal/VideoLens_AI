import {
  MAX_NEW_TOKENS,
  OFFSCREEN_DOCUMENT_PATH,
  WHISPER_BASE_MODEL,
  WHISPER_BASE_PIPELINE_CONFIG,
} from "@/lib/constants";
import {
  AudioPipelineInputs,
  Tensor,
  TextStreamer,
  full,
} from "@huggingface/transformers";
import AutomaticSpeechRecognitionRealtimePipelineFactory from "./AutomaticSpeechRecognitionRealtimePipelineFactory";

// NOTE: background would not render, set a lock to avoid calling pipeline multiple times
let isModelsLoading = false;
let activeTab: MainPage.ChromeTab | null = null;

const MODEL_ID = WHISPER_BASE_MODEL; // Replace with your model ID
const MODEL_CONFIG = WHISPER_BASE_PIPELINE_CONFIG;

// Get the full paths for encoder and decoder
const ENCODER_PATH = `onnx/encoder_model${
  MODEL_CONFIG.dtype.encoder_model === "fp32"
    ? ""
    : "_" + MODEL_CONFIG.dtype.encoder_model
}.onnx`;
const DECODER_PATH = `onnx/decoder_model_merged${
  MODEL_CONFIG.dtype.decoder_model_merged === "fp32"
    ? ""
    : "_" + MODEL_CONFIG.dtype.decoder_model_merged
}.onnx`;

const REQUIRED_FILES = [
  // Encoder files
  "config.json",
  ENCODER_PATH,
  // Decoder files
  "generation_config.json",
  DECODER_PATH,
  // Tokenizer files
  "tokenizer.json",
  "tokenizer_config.json",
  "vocab.json",
];

/********************************************************* Handle Message from Main ************************************************************/

export default defineBackground(() => {
  browser.action.onClicked.addListener(async (tab) => {
    activeTab = tab;
    if (tab.id) {
      browser.tabs.sendMessage(tab.id, { status: "TOGGLE_PANEL" });
    }
  });

  browser.runtime.onMessage.addListener(
    async (
      request: MainPage.MessageToBackground | Offscreen.MessageToBackground,
      sender
    ) => {
      if (sender.tab) {
        activeTab = sender.tab;
      }

      if (request.action === "checkModelsLoaded") {
        if (!isModelsLoading) {
          isModelsLoading = true;
          const result = await checkModelsLoaded();
          if (activeTab) {
            sendMessageToInject({ status: "modelsLoaded", result });
          }
          isModelsLoading = false;
        }
      } else if (request.action === "loadWhisperModel") {
        loadModelFiles();
      } else if (request.action === "captureBackground") {
        if (activeTab) {
          console.log("tab in background", activeTab);
          startRecordTab(activeTab);
        } else {
          console.error("No tabId provided for capture");
        }
      } else if (request.action === "transcribe") {
        const audioData = new Float32Array(request.data);
        const result = await transcribeRecord({
          audio: audioData as AudioPipelineInputs,
          language: request.language,
        });

        if (result === null || !activeTab) {
          console.error("background: transcribe, result or tabID not exist");
          return;
        }
        sendMessageToInject({
          status: "completeChunk",
          data: result,
        });
      } else if (request.action === "beginRecording") {
        sendMessageToInject({ status: "beginRecording" });
      } else if (request.action === "stopCaptureBackground") {
        sendMessageToOffscreenDocument({ action: "stopCaptureContent" });
      }
    }
  );
});

async function checkModelsLoaded(): Promise<boolean> {
  try {
    // Check if files exist in browser's HTTP cache
    const fileChecks = await Promise.all(
      REQUIRED_FILES.map(async (file) => {
        const url = `https://huggingface.co/${MODEL_ID}/resolve/main/${file}`;
        try {
          // Try to fetch from cache only, without same-origin restriction
          const response = await fetch(url, {
            method: "HEAD",
            cache: "force-cache",
            credentials: "omit",
          });
          return response.ok;
        } catch {
          return false;
        }
      })
    );

    return fileChecks.every((exists) => exists);
  } catch (e) {
    console.log("Model files not found in cache:", e);
    return false;
  }
}

/************************************************************* Send Message to Main app ***********************************************************/

const sendMessageToInject = (message: Background.MessageToInject) => {
  if (activeTab) {
    try {
      browser.tabs.sendMessage(activeTab.id, message);
    } catch (e) {
      console.error("Error sending message:", e);
    }
  } else {
    console.error("No active tab to send message to");
  }
};

// TODO load model progress render
const handleModelFilesMessage = (message: Background.ModelFileMessage) => {
  if (
    [
      "initiate", // initialize
      "progress", // get the download pregress
      "done", // done for one file
      "loading", // loading the model files locally
      "ready", // all the model files are ready
    ].includes(message.status)
  ) {
    sendMessageToInject(message);
  }
};

const loadModelFiles = async () => {
  // Load the pipeline and save it for future use.
  // We also add a progress callback to the pipeline so that we can
  // track model loading.

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_tokenizer, _processor, model] =
    await AutomaticSpeechRecognitionRealtimePipelineFactory.getInstance(
      handleModelFilesMessage
    );

  // Assign the retrieved instances to the variables
  handleModelFilesMessage({
    status: "loading",
    msg: "Compiling shaders and warming up model...",
  });

  // Run model with dummy input to compile shaders
  await model.generate({
    // NOTE: configurable for different model
    input_features: full([1, 80, 3000], 0.0),
    max_new_tokens: 1,
  });

  handleModelFilesMessage({ status: "ready" });
};

/************************************************************** Handle Audio data *****************************************************************/

// NOTE: can be used for debug, to check the message during transcribing
const handleTranscribeMessage = (message: Background.TranscrbeMessage) => {
  // transcribing, 'error'
  if (["startAgain", "completeChunk"].includes(message.status)) {
    sendMessageToInject(message);
  }

  if (message.status === "transcribing") {
  }

  if (message.status === "error") {
    alert(
      `An error occurred: "${message.error.message}". Please file a bug report.`
    );
  }
};

const transcribeRecord = async ({
  audio,
  language,
}: {
  audio: AudioPipelineInputs;
  language: string;
}) => {
  const [tokenizer, processor, model] =
    await AutomaticSpeechRecognitionRealtimePipelineFactory.getInstance();

  let startTime;
  let numTokens = 0;
  let tps: number = 0;

  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,
    callback_function: (output: Background.Chunks) => {
      startTime ??= performance.now();

      if (numTokens++ > 0) {
        tps = (numTokens / (performance.now() - startTime)) * 1000;
        handleTranscribeMessage({
          status: "transcribing",
          chunks: output,
          tps,
        });
      }
    },
  });

  const inputs = await processor(audio);

  const outputs = await model.generate({
    ...inputs,
    max_new_tokens: MAX_NEW_TOKENS,
    language,
    streamer,
  });

  const outputText = tokenizer.batch_decode(outputs as Tensor, {
    skip_special_tokens: true,
  });
  console.log("transcript:", outputText);
  return { chunks: outputText, tps };
};

async function startRecordTab(tab: MainPage.ChromeTab) {
  if (!tab.url?.startsWith("chrome://")) {
    try {
      await closeOffscreenDocument();

      if (!(await hasOffscreenDocument())) {
        await createOffscreenDocument();
      }

      // Use Promise wrapper for better error handling
      browser.tabCapture.getMediaStreamId(
        { targetTabId: tab.id },
        async (streamId) => {
          console.log("background: startRecordTab streamId", streamId);
          await sendMessageToOffscreenDocument({
            action: "captureContent",
            data: streamId,
          });
        }
      );
    } catch (e) {
      console.error("startRecordTab error:", e);
    }
  } else {
    const error = "Cannot capture chrome:// URLs";
    console.error(error);
  }
}

async function sendMessageToOffscreenDocument(
  msg: Omit<Background.MessageToOffscreen, "target" | "tab">
) {
  browser.runtime.sendMessage({
    ...msg,
    target: "offscreen",
    tab: activeTab,
  });
}

async function createOffscreenDocument() {
  await browser.offscreen.createDocument({
    url: browser.runtime.getURL(OFFSCREEN_DOCUMENT_PATH) as string,
    reasons: ["USER_MEDIA" as chrome.offscreen.Reason],
    justification: "Recording from chrome.tabCapture API",
  });
}

async function closeOffscreenDocument() {
  if (!(await hasOffscreenDocument())) {
    return;
  }
  await browser.offscreen.closeDocument();
}

async function hasOffscreenDocument() {
  const contexts = await browser.runtime?.getContexts({
    contextTypes: [browser.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [browser.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)],
  });

  if (contexts !== null) {
    return contexts.length > 0;
  } else {
    return false;
  }
}
