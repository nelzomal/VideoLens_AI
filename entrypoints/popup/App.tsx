import React from "react";
import { match } from "ts-pattern";

const sendMessageToBackground = browser.runtime
  .sendMessage<MainPage.MessageToBackground>;

const App = () => {
  const [isWhisperModelReady, setIsWhisperModelReady] = useState(false);

  const receiveMessageFromBackground = (
    messageFromBg: Background.MessageToMain
  ) => {
    match(messageFromBg)
      // model files
      .with({ status: "modelsLoaded" }, () => {
        setIsWhisperModelReady(true);
      });
  };

  useEffect(() => {
    console.log("isWhisperModelReady: ", isWhisperModelReady);
    if (!isWhisperModelReady) {
      sendMessageToBackground({ action: "loadWhisperModel" });
    }

    browser.runtime.onMessage.addListener(receiveMessageFromBackground);
  }, []);

  useEffect(() => {}, []);

  return (
    <>
      {isWhisperModelReady ? (
        // show record button
        <></>
      ) : (
        <div className="animate-pulse text-gray-600">
          Checking model status...
        </div>
      )}
    </>
  );
};

export default App;
