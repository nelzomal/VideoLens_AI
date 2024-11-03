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
  full,
  PreTrainedModel,
  PreTrainedTokenizer,
  Processor,
  Tensor,
  TextStreamer,
  WhisperForConditionalGeneration
} from "@huggingface/transformers";
import { match } from "ts-pattern";

const sendMessage = browser.runtime
  .sendMessage<Background.MessageFromBackground>;

let isModelLoaded = false;

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (request: MainPage.MessageToBackground) => {
      match(request)
        .with({ action: "loadWhisperModel" }, async () => {
          await loadModelFiles();
          sendMessage({ status: "modelsLoaded" });
        })
        .with({ action: "captureBackground" }, ({ tab }) => {
          console.log("captureBackground received: ", tab.id);
          captureContent(tab.id);
        })
        .with({ action: "transcribe" }, async ({ data, language }) => {
          const audioData = new Float32Array(data);
          const result = await transcribeRecord({
            audio: audioData as AudioPipelineInputs,
            language
          });

          if (result === null) return;

          sendMessage({ status: "completeChunk", data: result });
        });
    }
  );
});

async function captureContent(tabId: number) {
  // Get a MediaStream for the active tab.
  browser.tabCapture.getMediaStreamId({ targetTabId: tabId }, (streamId) => {
    // Send the stream ID to the offscreen document to start recording.
    sendMessage({
      status: "captureContent",
      data: streamId
    });
  });
}

// TODO load model progress render
const handleModelFilesMessage = (message: Background.ModelFileMessage) => {
  match(message)
    .with(
      { status: "initiate" }, // initialize
      { status: "progress" }, // get the download pregress
      { status: "done" }, // done for one file
      { status: "ready" }, // all the model files are ready
      (msg) => {
        // Model file start load: add a new progress item to the list.
        sendMessage(msg);
      }
    )
    .otherwise(() => null);
};

const loadModelFiles = async () => {
  if (isModelLoaded) {
    return;
  }

  const [_tokenizer, _processor, model] =
    await AutomaticSpeechRecognitionPipeline
      .getInstance
      // handleModelFilesMessage
      ();

  // Run model with dummy input to compile shaders
  await model.generate({
    // NOTE: configurable for different model
    input_features: full([1, 80, 3000], 0.0),
    max_new_tokens: 1
  });

  isModelLoaded = true;
};

// TODO why need this?
const handleTranscribeMessage = (message: Background.TranscrbeMessage) => {
  match(message)
    .with({ status: "startAgain" }, (msg) => {
      sendMessage(msg);
    })
    .with({ status: "completeChunk" }, (msg) => {
      sendMessage(msg);
    })
    .with({ status: "transcribing" }, () => {
      // transcribing the file
      //   setTranscript({
      //     isBusy: true,
      //     text: message.data.text,
      //     tps: message.data.tps,
      //     chunks: message.data.chunks
      //   });
    })
    .with({ status: "error" }, ({ error }) => {
      alert(`An error occurred: "${error.message}". Please file a bug report.`);
    })
    .exhaustive();
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
      {
        ...WHISPER_BASE_PIPELINE_CONFIG,
        progress_callback
      }
    );

    return Promise.all([this.tokenizer, this.processor, this.model]);
  }
}
