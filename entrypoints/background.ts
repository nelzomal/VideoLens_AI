import {
  MAX_NEW_TOKENS,
  WHISPER_BASE_MODEL,
  WHISPER_BASE_PIPELINE_CONFIG
  // WHISPER_LARGE_V3_TURBO_MODEL,
  // WHISPER_LARGE_V3_TURBO_PIPELINE_CONFIG
} from "@/lib/constants";
import {
  AudioPipelineInputs,
  AutoProcessor,
  AutoTokenizer,
  PreTrainedModel,
  PreTrainedTokenizer,
  Processor,
  Tensor,
  pipeline,
  TextStreamer,
  WhisperForConditionalGeneration,
  full
} from "@huggingface/transformers";

// currently browser cannnot handle bigger model, maximum base
// check the onnx file: https://huggingface.co/onnx-community/whisper-base/tree/main/onnx
const model = "onnx-community/whisper-base";

export default defineBackground(() => {
  /********************************************************* Handle Message from Main ************************************************************/

  chrome.runtime.onMessage.addListener(
    async (request: MainPage.MessageToBackground) => {
      if (request.action === "checkModelsLoaded") {
        const result = await checkModelsLoaded();
        sendMessageToMain({ status: "modelsLoaded", result });
      } else if (request.action === "loadWhisperModel") {
        loadModelFiles();
      } else if (request.action === "captureBackground") {
        startRecordTab(request.tab.id);
      } else if (request.action === "transcribe") {
        const audioData = new Float32Array(request.data);
        const result = await transcribeRecord({
          audio: audioData as AudioPipelineInputs,
          language: request.language
        });

        if (result === null) return;

        sendMessageToMain({ status: "completeChunk", data: result });
      }
    }
  );
});

async function checkModelsLoaded() {
  try {
    // Load the pipeline for automatic speech recognition
    const asrPipeline = await pipeline(
      "automatic-speech-recognition",
      WHISPER_BASE_MODEL,
      WHISPER_BASE_PIPELINE_CONFIG
    );

    // Assuming you have an audio input as a Float32Array or other valid format
    const audioInput = new Float32Array([0.0, 0.1, 0.15, 0.2, 0.05, -0.05]);

    // Run the speech recognition model on the audio input
    const transcription = await asrPipeline(audioInput, {
      language: "english"
    });

    return !!transcription;
  } catch (error) {
    // Handle errors that occur during model loading
    console.error("Error loading the model:", error);
    return false;
  }
}

/************************************************************** Handle Auido data *****************************************************************/

class AutomaticSpeechRecognitionPipeline {
  static model_id: string | null = null;
  static tokenizer: Promise<PreTrainedTokenizer> | null = null;
  static processor: Promise<Processor> | null = null;
  static model: Promise<PreTrainedModel> | null = null;

  static async getInstance(
    progress_callback?: (data: Background.ModelFileMessage) => void
  ) {
    this.model_id = WHISPER_BASE_MODEL;

    this.tokenizer = AutoTokenizer.from_pretrained(this.model_id, {
      progress_callback
    });
    this.processor = AutoProcessor.from_pretrained(this.model_id, {
      progress_callback
    });

    this.model = WhisperForConditionalGeneration.from_pretrained(
      this.model_id,
      { ...WHISPER_BASE_PIPELINE_CONFIG, progress_callback }
    );

    return Promise.all([this.tokenizer, this.processor, this.model]);
  }
}

/************************************************************* Send Message to Main app ***********************************************************/

const sendMessageToMain = chrome.runtime
  .sendMessage<Background.MessageFromBackground>;

// TODO load model progress render
const handleModelFilesMessage = (message: Background.ModelFileMessage) => {
  if (
    message.status in
    [
      "initiate", // initialize
      "progress", // get the download pregress
      "done", // done for one file
      "ready" // all the model files are ready
    ]
  ) {
    sendMessageToMain(message);
  }
};

const loadModelFiles = async () => {
  // Load the pipeline and save it for future use.
  // We also add a progress callback to the pipeline so that we can
  // track model loading.

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_tokenizer, _processor, model] =
    await AutomaticSpeechRecognitionPipeline.getInstance(
      handleModelFilesMessage
    );

  handleModelFilesMessage({
    status: "loading",
    msg: "Compiling shaders and warming up model..."
  });

  // Run model with dummy input to compile shaders
  await model.generate({
    // NOTE: configurable for different model
    input_features: full([1, 80, 3000], 0.0),
    max_new_tokens: 1
  });

  handleModelFilesMessage({ status: "ready" });
};

// NOTE: can be used for debug, to check the message during transcribing
const handleTranscribeMessage = (message: Background.TranscrbeMessage) => {
  // transcribing, 'error'
  if (message.status in ["startAgain", "completeChunk"]) {
    sendMessageToMain(message);
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
  language
}: {
  audio: AudioPipelineInputs;
  language: string;
}) => {
  const [tokenizer, processor, model] =
    await AutomaticSpeechRecognitionPipeline.getInstance();

  let startTime;
  let numTokens = 0;
  let tps: number = 0;

  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,

    // TODO linter TextStreamer skip_special_tokens error
    skip_special_tokens: true,
    callback_function: (output: Background.Chunks) => {
      startTime ??= performance.now();

      if (numTokens++ > 0) {
        tps = (numTokens / (performance.now() - startTime)) * 1000;
        handleTranscribeMessage({
          status: "transcribing",
          chunks: output,
          tps
        });
      }
    }
  });

  const inputs = await processor(audio);

  const outputs = await model.generate({
    ...inputs,
    max_new_tokens: MAX_NEW_TOKENS,
    language,
    streamer
  });

  const outputText = tokenizer.batch_decode(outputs as Tensor, {
    skip_special_tokens: true
  });
  console.log("transcript:", outputText);
  return { chunks: outputText, tps };
};

async function startRecordTab(tabId: number) {
  // const recording = false;

  // if (recording) {
  //   sendMessageToMain({ status: "stop-recording" });
  //   return;
  // }

  // Get a MediaStream for the active tab.
  chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, (streamId) => {
    // Send the stream ID to the offscreen document to start recording.
    sendMessageToMain({
      status: "captureContent",
      data: streamId
    });
  });
}
