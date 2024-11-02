export const WHISPER_SAMPLING_RATE = 16_000;
export const MAX_AUDIO_LENGTH = 30; // seconds
export const MAX_NEW_TOKENS = 64;

export const WHISPER_LARGE_V3_TURBO_MODEL =
  "onnx-community/whisper-large-v3-turbo";
export const WHISPER_LARGE_V3_TURBO_PIPELINE_CONFIG = {
  dtype: {
    encoder_model: "fp16",
    decoder_model_merged: "q4", // or q4, fp16
  },
  device: "webgpu",
} as const;

export const WHISPER_BASE_MODEL = "onnx-community/whisper-base";
export const WHISPER_BASE_PIPELINE_CONFIG = {
  dtype: {
    encoder_model: "fp32", // 'fp16' works too
    decoder_model_merged: "q4", // or 'fp32' ('fp16' is broken)
  },
  device: "webgpu",
} as const;
