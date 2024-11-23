import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StreamingMessage } from "@/entrypoints/content/types/chat";

interface ChatMessageProps {
  message: StreamingMessage;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
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
          className={`mx-2 p-3 rounded-lg hover:bg-gray-800 transition-colors duration-150 ${
            message.sender === "user" ? "text-gray-100" : "text-gray-400"
          }`}
        >
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
