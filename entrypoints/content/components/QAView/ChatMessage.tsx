import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message } from "@/entrypoints/content/types/chat";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const getMessageStyle = () => {
    if (message.sender === "user") {
      return "text-gray-100 bg-gray-700";
    }

    // Different styles for AI messages based on type
    switch (message.type) {
      case "question":
        return "text-blue-300 bg-blue-950/50";
      case "explanation":
        return "text-green-300 bg-green-950/50";
      default:
        return "text-gray-300 bg-gray-800";
    }
  };

  const formatContent = (content: string) => {
    if (message.sender === "ai") {
      return content.replace(/^\*\*|\*\*$/g, "");
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
