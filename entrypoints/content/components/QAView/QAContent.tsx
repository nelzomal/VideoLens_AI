import { ChatMessage } from "./ChatMessage";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQA } from "./hooks/useQA";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef } from "react";

interface QAContentProps {
  isActive: boolean;
}

export function QAContent({ isActive }: QAContentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    messages,
    input,
    isAIThinking,
    setInput,
    handleSend,
    handleOptionSelect,
    isInitialized,
  } = useQA(isActive);
  const messageKeys = useRef(new Map<number, string>());

  const getMessageKey = (index: number) => {
    if (!messageKeys.current.has(index)) {
      messageKeys.current.set(
        index,
        `chat-message-${index}-${Math.random().toString(36).slice(2)}`
      );
    }
    return messageKeys.current.get(index);
  };

  function toggleYouTubeVideoPlayback() {
    const video = document.querySelector("video");
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  }
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === " ") {
      toggleYouTubeVideoPlayback();
    }
    e.nativeEvent.stopImmediatePropagation();
    if (e.key === "Enter" && !isAIThinking && isInitialized) {
      handleSend(inputRef);
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
          {messages.map((message, index) => (
            <ChatMessage
              key={getMessageKey(index)}
              message={message}
              onOptionSelect={handleOptionSelect}
            />
          ))}
          {isAIThinking && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-secondary/20 p-2 rounded">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 w-full border-t border-border bg-background mt-auto">
        <div className="flex items-center gap-2 p-4">
          <Input
            ref={inputRef}
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
            disabled={isAIThinking || !isInitialized}
          />
          <Button
            onClick={() => handleSend(inputRef)}
            disabled={isAIThinking || !isInitialized}
            variant="mui-contained"
            className="shadow-sm"
          >
            Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
