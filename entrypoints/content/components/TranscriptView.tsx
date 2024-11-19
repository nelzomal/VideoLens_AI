import Progress from "@/components/ui/Progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import LanguageSelector from "@/components/LanguageSelector";
import { sendMessageToBackground } from "../lib/utils";
import { useWhisperModel } from "../hooks/useWhisperModel";
import { Recording } from "./Recording";

export function TranscriptView() {
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  const { isWhisperModelReady, isCheckingModels, progressItems, transcripts } =
    useWhisperModel();

  return (
    <div className="w-full p-4 mb-4 flex-grow text-white flex flex-col overflow-hidden">
      <div className="w-full flex flex-row justify-between items-center flex-none">
        <LanguageSelector
          value={selectedLanguage}
          onChange={setSelectedLanguage}
        />
        {isWhisperModelReady ? (
          <Recording />
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
        <div className="flex flex-col overflow-auto">
          <div className="flex-none p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Transcript</h2>
          </div>
          <ScrollArea className="flex-grow overflow-auto">
            {/* <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">3.66 - 5.66</span>
              <span className="text-red-500"> You game?</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">6.66 - 8.66</span>
              <span className="text-red-500"> I'm game</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">9.66 - 12.24</span>
              <span className="text-red-500"> (upbeat music)</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">12.66 - 15.50</span>
              <span className="text-red-500"> ♪ When you know yourself ♪</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">15.66 - 17.66</span>
              <span className="text-red-500">
                {" "}
                partner passing lanes and also
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">18.66 - 21.66</span>
              <span className="text-red-500">
                {" "}
                the ball side the side. There's one example.
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">21.66 - 24.66</span>
              <span className="text-red-500">
                {" "}
                of that. That's his first three of this
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">24.66 - 27.70</span>
              <span className="text-red-500">
                {" "}
                sees it and will talk a little bit more about it. He has been
                routine.
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">27.66 - 30.66</span>
              <span className="text-red-500">
                {" "}
                a slow starter. It is a good sign for
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">30.66 - 31.50</span>
              <span className="text-red-500"> Here it's man.</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">33.66 - 36.66</span>
              <span className="text-red-500">
                {" "}
                Get home quick rig. Get off to a slow shot.
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">
              <span className="text-grey-400">36.66 - 39.16</span>
              <span className="text-red-500">
                {" "}
                the start from a boat the arquit has found the rain.
              </span>
            </div>
          </div> */}
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
  );
}
