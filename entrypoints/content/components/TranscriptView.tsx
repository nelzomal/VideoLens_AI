import Progress from "@/components/ui/Progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import LanguageSelector from "@/components/LanguageSelector";

interface TranscriptViewProps {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  isWhisperModelReady: boolean;
  isCheckingModels: boolean | string;
  recordUI: () => JSX.Element;
  progressItems: Array<Background.ModelFileProgressItem>;
  transcripts: Array<[string, string]>;
  sendMessageToBackground: (message: MainPage.MessageToBackground) => void;
}

export function TranscriptView({
  selectedLanguage,
  setSelectedLanguage,
  isWhisperModelReady,
  isCheckingModels,
  recordUI,
  progressItems,
  transcripts,
  sendMessageToBackground,
}: TranscriptViewProps) {
  return (
    <div className="w-full bg-black mb-4 ">
      <div className="w-full flex flex-col">
        <div className="w-full flex flex-row justify-between items-center">
          <LanguageSelector
            value={selectedLanguage}
            onChange={setSelectedLanguage}
          />
          {isWhisperModelReady ? (
            recordUI()
          ) : (
            <div className="w-full text-center">
              {isCheckingModels ? (
                isCheckingModels !== true ? (
                  isCheckingModels
                ) : (
                  <div className="animate-pulse text-gray-600">
                    Checking model status...
                  </div>
                )
              ) : (
                <button
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
                  onClick={() =>
                    sendMessageToBackground({ action: "loadWhisperModel" })
                  }
                >
                  Load Models
                </button>
              )}
            </div>
          )}
        </div>

        {progressItems.length > 0 && (
          <div className="relative z-10 p-4 w-full text-center">
            <label>Loading model files... (only run once)</label>
            {progressItems.map((data) => (
              <div key={data.file}>
                <Progress text={data.file} percentage={data.progress} />
              </div>
            ))}
          </div>
        )}

        {transcripts.length > 0 && (
          <div className="flex flex-col">
            <div className="flex-none p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Transcript</h2>
            </div>
            <ScrollArea className="flex-grow overflow-auto">
              {transcripts.map((entry, index) => (
                <div key={index} className="space-y-1">
                  <div className="font-medium text-primary">
                    <span className="text-grey-400">{entry[0]}</span>
                    <span className="text-red-500">{entry[1]}</span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
