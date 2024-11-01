import {
  WHISPER_BASE_MODEL,
  WHISPER_BASE_PIPELINE_CONFIG,
  WHISPER_LARGE_V3_TURBO_MODEL,
  WHISPER_LARGE_V3_TURBO_PIPELINE_CONFIG,
} from "@/lib/constants";
import {
  AutoProcessor,
  AutoTokenizer,
  full,
  PreTrainedModel,
  PreTrainedTokenizer,
  Processor,
  WhisperForConditionalGeneration,
} from "@huggingface/transformers";
import { match } from "ts-pattern";

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener(
    (request: MainPage.MessageToBackground, sender) => {
      match(request).with({ action: "loadWhisperModel" }, async () => {
        console.log("loadWhisperModel msg received");
        await loadModelFiles();
        sendMessageToMain({ status: "modelsLoaded" });
      });
      // .with({ action: "loadModels" }, () => {
      //   loadModelFiles();
      // })
      // .with({ action: "startCapture" }, ({ tab }) => {
      //   console.log("startCapture sender", sender, request);
      //   startRecordTab(tab.id);
      // })
      // .with({ action: "transcribe" }, async ({ data, language }) => {
      //   const audioData = new Float32Array(data);
      //   const result = await transcribeRecord({
      //     audio: audioData as AudioPipelineInputs,
      //     language,
      //   });

      //   if (result === null) return;

      //   sendMessageToMain({ status: "completeChunk", data: result });
      // })
      // .with({ action: "stopCapture" }, () => null)
      // .exhaustive();
    }
  );
});

const sendMessageToMain = chrome.runtime.sendMessage<Background.MessageToMain>;

const handleModelFilesMessage = (message: Background.ModelFileMessage) => {
  match(message)
    .with(
      { status: "initiate" }, // initialize
      { status: "progress" }, // get the download pregress
      { status: "done" }, // done for one file
      { status: "ready" }, // all the model files are ready
      (msg) => {
        // Model file start load: add a new progress item to the list.
        sendMessageToMain(msg);
      }
    )
    .otherwise(() => null);
};

const loadModelFiles = async () => {
  const [_tokenizer, _processor, model] =
    await AutomaticSpeechRecognitionPipeline
      .getInstance
      // handleModelFilesMessage
      ();

  // Run model with dummy input to compile shaders
  await model.generate({
    input_features: full([1, 80, 3000], 0.0),
    max_new_tokens: 1,
  });
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
      progress_callback,
    });
    this.processor = AutoProcessor.from_pretrained(this.model_id, {
      progress_callback,
    });

    this.model = WhisperForConditionalGeneration.from_pretrained(
      this.model_id,
      {
        ...WHISPER_BASE_PIPELINE_CONFIG,
        progress_callback,
      }
    );

    return Promise.all([this.tokenizer, this.processor, this.model]);
  }
}
