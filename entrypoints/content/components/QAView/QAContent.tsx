import { ChatMessage } from "./ChatMessage";
import { StreamingMessage } from "../../types/chat";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQA } from "./hooks/useQA";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QAContentProps {}

export function QAContent({}: QAContentProps) {
  const { messages, input, isLoading, setInput, handleSend, isInitialized } =
    useQA();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (e.key === "Enter" && !isLoading && isInitialized) {
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setInput(e.target.value);
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 w-full border-t border-gray-700 bg-background mt-auto">
        <div className="flex items-center gap-2 p-4">
          <Input
            type="text"
            placeholder={
              isInitialized ? "Ask a question about the video..." : "Loading..."
            }
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onClick={handleInputClick}
            onFocus={(e) => e.stopPropagation()}
            className="flex-grow"
            disabled={isLoading || !isInitialized}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !isInitialized}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
