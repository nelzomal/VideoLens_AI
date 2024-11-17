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
          className={`mx-2 p-2 rounded-lg ${
            message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100"
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
