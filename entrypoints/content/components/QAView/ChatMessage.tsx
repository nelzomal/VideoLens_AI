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
      return "text-gray-100 bg-gray-700";
    }

    // Different styles for AI messages based on type
    switch (message.styleType) {
      case "blue":
        return "text-blue-300 bg-blue-950/50";
      case "green":
        return "text-green-300 bg-green-950/50";
      default:
        return "text-gray-300 bg-gray-800";
    }
  };

  const getOptionStyle = (option: Option) => {
    if (!selectedOption) {
      return "bg-gray-700/50 hover:bg-gray-600/50 text-gray-100";
    }

    if (option === selectedOption) {
      return option.isCorrect
        ? "bg-green-600/50 text-white"
        : "bg-red-600/50 text-white";
    }

    if (option.isCorrect && selectedOption) {
      return "bg-green-600/50 text-white";
    }

    return "bg-gray-700/50 text-gray-400";
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
        <Avatar className="w-6 h-6">
          <AvatarFallback>
            {message.sender === "user" ? "U" : "AI"}
          </AvatarFallback>
        </Avatar>
        <div
          className={`mx-2 p-3 rounded-lg ${getMessageStyle()} hover:brightness-110 transition-all duration-150`}
        >
          {formatContent(message.content)}
          {message.isStreaming && (
            <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
