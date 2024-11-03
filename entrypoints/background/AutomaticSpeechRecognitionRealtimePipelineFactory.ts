import {
  WHISPER_BASE_MODEL,
  WHISPER_BASE_PIPELINE_CONFIG
} from "@/lib/constants";
import {
  AutoProcessor,
  AutoTokenizer,
  PreTrainedModel,
  PreTrainedTokenizer,
  Processor,
  WhisperForConditionalGeneration
} from "@huggingface/transformers";

export default class AutomaticSpeechRecognitionRealtimePipelineFactory {
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
