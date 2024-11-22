import { TabTemplate } from "../TabTemplate";
import { QAControls } from "./QAControls";
import { QAProgress } from "./QAProgress";
import { QAContent } from "./QAContent";
import { useQA } from "./hooks/useQA";

export function QAView() {
  const { messages, input, isLoading, setInput, handleSend } = useQA();

  return (
    <TabTemplate
      controls={
        <QAControls
          input={input}
          isLoading={isLoading}
          setInput={setInput}
          handleSend={handleSend}
        />
      }
      progressSection={<QAProgress isLoading={isLoading} />}
      mainContent={<QAContent messages={messages} isLoading={isLoading} />}
      className="text-white"
    />
  );
}
