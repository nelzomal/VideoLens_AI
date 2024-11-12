import {
  WHISPER_BASE_MODEL,
  WHISPER_BASE_PIPELINE_CONFIG,
} from "@/lib/constants";
import {
  AutoProcessor,
  AutoTokenizer,
  PreTrainedModel,
  PreTrainedTokenizer,
  Processor,
  WhisperForConditionalGeneration,
} from "@huggingface/transformers";

export default class AutomaticSpeechRecognitionRealtimePipelineFactory {
  private static instance: AutomaticSpeechRecognitionRealtimePipelineFactory | null =
    null;
  private static model_id: string = WHISPER_BASE_MODEL;
  private model: Promise<PreTrainedModel> | null = null;
  private initializationPromise: Promise<
    [PreTrainedTokenizer, Processor, PreTrainedModel]
  > | null = null;

  private constructor() {}

  public static async getInstance(
    progress_callback?: (data: Background.ModelFileMessage) => void
  ): Promise<[PreTrainedTokenizer, Processor, PreTrainedModel]> {
    if (!this.instance) {
      this.instance = new AutomaticSpeechRecognitionRealtimePipelineFactory();
    }

    return this.instance.initialize(progress_callback);
  }

  private async initialize(
    progress_callback?: (data: Background.ModelFileMessage) => void
  ): Promise<[PreTrainedTokenizer, Processor, PreTrainedModel]> {
    if (this.model) {
      return this.initializationPromise!;
    }

    this.initializationPromise = Promise.all([
      AutoTokenizer.from_pretrained(
        AutomaticSpeechRecognitionRealtimePipelineFactory.model_id,
        { progress_callback }
      ),
      AutoProcessor.from_pretrained(
        AutomaticSpeechRecognitionRealtimePipelineFactory.model_id,
        { progress_callback }
      ),
      WhisperForConditionalGeneration.from_pretrained(
        AutomaticSpeechRecognitionRealtimePipelineFactory.model_id,
        { ...WHISPER_BASE_PIPELINE_CONFIG, progress_callback }
      ),
    ]);

    this.model = this.initializationPromise.then(([, , model]) => model);
    return this.initializationPromise;
  }
}
