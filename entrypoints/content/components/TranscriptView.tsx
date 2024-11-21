import Progress from "@/components/ui/Progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { handleTranscriptClick, sendMessageToBackground } from "../lib/utils";
import { useWhisperModel } from "../hooks/useWhisperModel";
import { Recording } from "./Recording";
import { useUrlChange } from "../hooks/useUrlChange";

export function TranscriptView() {
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  const {
    isWhisperModelReady,
    isCheckingModels,
    progressItems,
    transcripts,
    resetTranscripts,
  } = useWhisperModel();

  // Reset transcripts when URL changes
  useUrlChange(() => {
    resetTranscripts();
    setSelectedLanguage("english");
  });

  return (
    <div className="w-full p-4 mb-4 flex-grow text-white flex flex-col overflow-hidden">
      <div className="w-full flex flex-row justify-between items-center flex-none">
        <LanguageSelector
          value={selectedLanguage}
          onChange={setSelectedLanguage}
        />
        {isWhisperModelReady ? (
          <Recording language={selectedLanguage} />
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
                  sendMessageToBackground({
                    action: "loadWhisperModel",
                    language: selectedLanguage,
                  })
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
        <div className="flex flex-col overflow-auto">
          <div className="flex-none p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Transcript</h2>
          </div>
          <ScrollArea className="flex-grow overflow-auto">
            {transcripts.map((entry) => (
              <div
                key={entry.time + entry.text}
                className="flex flex-col p-3 hover:bg-gray-800 cursor-pointer transition-colors duration-150 gap-6"
                onClick={() => handleTranscriptClick(entry.time)}
              >
                <span className="text-[#3ea6ff] font-medium min-w-[52px]">
                  {Math.floor(entry.time / 60)}:
                  {(Math.floor(entry.time) % 60).toString().padStart(2, "0")}
                </span>
                <span className="text-gray-100">{entry.text}</span>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
