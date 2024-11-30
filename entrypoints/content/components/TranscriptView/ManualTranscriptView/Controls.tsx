import LanguageSelector from "@/components/ui/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Language } from "@/lib/constants";
import { RecordingStatus } from "@/entrypoints/content/types/transcript";
import { Recording } from "./Recording";
import { sendMessageToBackground } from "../../../lib/utils";

interface ControlsProps {
  sourceLanguage: Language;
  setSourceLanguage: (language: Language) => void;
  targetLanguage: Language;
  setTargetLanguage: (language: Language) => void;
  isWhisperModelReady: boolean;
  isCheckingModels: boolean | string;
  recordingStatus: RecordingStatus;
  setRecordingStatus: (status: RecordingStatus) => void;
}

export default function Controls({
  sourceLanguage,
  setSourceLanguage,
  targetLanguage,
  setTargetLanguage,
  isWhisperModelReady,
  isCheckingModels,
  recordingStatus,
  setRecordingStatus,
}: ControlsProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col md:flex-row items-center justify-center space-x-0 md:space-x-2">
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source Language
          </label>
          <LanguageSelector
            value={sourceLanguage}
            onChange={setSourceLanguage}
          />
        </div>
        <div className="flex items-center justify-center my-2 md:my-6">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.33334 8H14.6667M14.6667 8L8.66668 2M14.6667 8L8.66668 14"
                stroke="#6B7280"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Language
          </label>
          <LanguageSelector
            value={targetLanguage}
            onChange={setTargetLanguage}
          />
        </div>
      </div>
      <div className="w-full">
        {isWhisperModelReady ? (
          <Recording
            language={sourceLanguage}
            recordingStatus={recordingStatus}
            setRecordingStatus={setRecordingStatus}
          />
        ) : (
          <div className="w-full text-center">
            {isCheckingModels ? (
              isCheckingModels !== true ? (
                isCheckingModels
              ) : (
                <div className="flex items-center justify-center gap-2 text-gray-600 text-base">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  Checking model status...
                </div>
              )
            ) : (
              <Button
                variant="mui-contained"
                size="lg"
                className="shadow-sm text-base font-medium h-11 px-8"
                onClick={() =>
                  sendMessageToBackground({
                    action: "loadWhisperModel",
                    language: sourceLanguage,
                  })
                }
              >
                Load Models
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
