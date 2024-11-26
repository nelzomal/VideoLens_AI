import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message, Option } from "@/entrypoints/content/types/chat";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
  onOptionSelect?: (option: Option) => void;
}

export function ChatMessage({ message, onOptionSelect }: ChatMessageProps) {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const getMessageStyle = () => {
    if (message.sender === "user") {
      return "text-foreground bg-primary/10";
    }

    // Different styles for AI messages based on type
    switch (message.styleType) {
      case "blue":
        return "text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30";
      case "green":
        return "text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900/30";
      default:
        return "text-foreground bg-secondary/20";
    }
  };

  const getOptionStyle = (option: Option) => {
    if (!selectedOption) {
      return "bg-secondary hover:bg-secondary/80 text-secondary-foreground";
    }

    if (option === selectedOption) {
      return option.isCorrect
        ? "bg-green-600 text-white"
        : "bg-red-600 text-white";
    }

    if (option.isCorrect && selectedOption) {
      return "bg-green-600 text-white";
    }

    return "bg-muted text-muted-foreground";
  };

  const formatContent = (content: string | Option[]) => {
    if (Array.isArray(content)) {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-gray-300 mb-2">
            Please select one of the following options:
          </p>
          {content.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // 65 is ASCII for 'A'
            return (
              <button
                key={`option-${index}-${option.text}`}
                className={`text-left px-4 py-2 rounded-md transition-colors duration-150 
                  ${getOptionStyle(option)}`}
                onClick={() => {
                  if (!selectedOption) {
                    setSelectedOption(option);
                    onOptionSelect?.(option);
                  }
                }}
                disabled={selectedOption !== null}
              >
                {`${letter}. ${option.text}`}
                {selectedOption === option && (
                  <span className="ml-2">{option.isCorrect ? "✓" : "✗"}</span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    // Handle string content as before
    if (message.sender === "ai") {
      return content.replace(/^\*\*|\*\*$/g, "").replace("**", "");
    }
    return content;
  };

  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      } mb-3`}
    >
      <div
        className={`flex items-start max-w-[80%] ${
          message.sender === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/20 text-primary">
            {message.sender === "user" ? "You" : "AI"}
          </AvatarFallback>
        </Avatar>
        <div
          className={`mx-2 p-3 rounded-lg shadow-sm ${getMessageStyle()} transition-all duration-150`}
        >
          {formatContent(message.content)}
          {message.isStreaming && (
            <span className="inline-block w-1 h-4 ml-1 bg-muted animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
