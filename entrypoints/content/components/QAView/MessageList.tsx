import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { StreamingMessage } from "../../types/chat";

interface MessageListProps {
  messages: StreamingMessage[];
  isLoading: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => (
  <ScrollArea className="flex-grow mb-4 pr-4">
    {messages.map((message) => (
      <ChatMessage key={message.id} message={message} />
    ))}
    {isLoading && (
      <div className="flex justify-start mb-4">
        <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>AI is thinking...</span>
        </div>
      </div>
    )}
  </ScrollArea>
);
