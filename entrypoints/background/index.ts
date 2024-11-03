import { MAX_NEW_TOKENS } from "@/lib/constants";
import {
  AudioPipelineInputs,
  AutomaticSpeechRecognitionPipeline,
  Tensor,
  TextStreamer,
  full,
  pipeline
} from "@huggingface/transformers";
import AutomaticSpeechRecognitionRealtimePipelineFactory from "./AutomaticSpeechRecognitionRealtimePipelineFactory";
import AutomaticSpeechRecognitionPipelineFactory from "./AutomaticSpeechRecognitionPipelineFactory";

/********************************************************* Handle Message from Main ************************************************************/

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
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
    const pipeline =
      (await AutomaticSpeechRecognitionPipelineFactory.getInstance()) as AutomaticSpeechRecognitionPipeline;

    // Assuming you have an audio input as a Float32Array or other valid format
    const audioInput = new Float32Array([0.0, 0.1, 0.15, 0.2, 0.05, -0.05]);

    // Run the speech recognition model on the audio input
    const transcription = await pipeline(audioInput, { language: "english" });

    return !!transcription;
  } catch (error) {
    // Handle errors that occur during model loading
    console.error("Error loading the model:", error);
    return false;
  }
}

/************************************************************* Send Message to Main app ***********************************************************/

const sendMessageToMain = browser.runtime
  .sendMessage<Background.MessageFromBackground>;

// TODO load model progress render
const handleModelFilesMessage = (message: Background.ModelFileMessage) => {
  if (
    [
      "initiate", // initialize
      "progress", // get the download pregress
      "done", // done for one file
      "ready" // all the model files are ready
    ].includes(message.status)
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
    await AutomaticSpeechRecognitionRealtimePipelineFactory.getInstance(
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

/************************************************************** Handle Audio data *****************************************************************/

// NOTE: can be used for debug, to check the message during transcribing
const handleTranscribeMessage = (message: Background.TranscrbeMessage) => {
  // transcribing, 'error'
  if (["startAgain", "completeChunk"].includes(message.status)) {
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
    await AutomaticSpeechRecognitionRealtimePipelineFactory.getInstance();

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
  // Get a MediaStream for the active tab.
  browser.tabCapture.getMediaStreamId({ targetTabId: tabId }, (streamId) => {
    // Send the stream ID to the offscreen document to start recording.
    sendMessageToMain({
      status: "captureContent",
      data: streamId
    });
  });
}
