import {
  WHISPER_BASE_MODEL,
  WHISPER_BASE_PIPELINE_CONFIG
} from "@/lib/constants";
import { AllTasks, pipeline } from "@huggingface/transformers";

export default class AutomaticSpeechRecognitionPipelineFactory {
  static instance: Promise<AllTasks[keyof AllTasks]> | null = null;

  static async getInstance() {
    if (this.instance === null) {
      this.instance = pipeline(
        "automatic-speech-recognition",
        WHISPER_BASE_MODEL,
        WHISPER_BASE_PIPELINE_CONFIG
      );
    }

    return this.instance;
  }
}
