import { ChatMessage } from "./ChatMessage";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQA } from "./hooks/useQA";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef, useEffect } from "react";

interface QAContentProps {}

export function QAContent({}: QAContentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    messages,
    input,
    isLoading,
    setInput,
    handleSend,
    isInitialized,
    hasReachedMaxQuestions,
  } = useQA();

  useEffect(() => {
    if (hasReachedMaxQuestions) {
      // const conversation = messages.reduce((acc, message) => {
      //   if (message.sender === "ai" && message.answer) {
      //     acc.push({
      //       question: message.content,
      //       correctAnswer: message.answer,
      //     });
      //   } else if (message.sender === "user") {
      //     // Add user's reply to the previous question
      //     if (acc.length > 0) {
      //       acc[acc.length - 1].userReply = message.content;
      //     }
      //   }
      //   return acc;
      // }, [] as Array<{ question: string; correctAnswer?: string; userReply?: string }>);
      // console.log("Q&A Session Summary:", conversation);
    }
  }, [hasReachedMaxQuestions, messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (e.key === "Enter" && !isLoading && isInitialized) {
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
            disabled={isLoading || !isInitialized}
          />
          <Button
            onClick={() => handleSend(inputRef)}
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
