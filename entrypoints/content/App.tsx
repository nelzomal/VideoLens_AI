import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

const App: React.FC = () => {
  const [transcripts, setTranscripts] = useState<string[]>([]);

  useEffect(() => {
    const receiveMessageFromBackground = (
      messageFromBg: Background.MessageFromBackground
    ) => {
      if (messageFromBg.status === "completeChunk") {
        console.log("content: ", messageFromBg.data);
        setTranscripts((prevTranscripts) => {
          return [...prevTranscripts, messageFromBg.data.chunks[0]];
        });
      }
    };

    browser.runtime.onMessage.addListener(receiveMessageFromBackground);
  }, []);

  console.log("transcripts: ", transcripts);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "300px",
        height: "100%",
        zIndex: 9999,
      }}
      className="w-80 flex flex-col border-l border-border bg-background"
    >
      <div className="flex-none p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Transcript</h2>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-4">
          {transcripts.map(
            (entry, index) => (
              console.log("entry: ", index, entry),
              (
                <div key={index} className="space-y-1">
                  <div className="font-medium text-primary">
                    <p className="text-red-500">{entry}</p>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default App;
