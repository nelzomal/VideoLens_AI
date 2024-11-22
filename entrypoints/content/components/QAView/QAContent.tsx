import { ChatMessage } from "./ChatMessage";
import { StreamingMessage } from "../../types/chat";
import { Loader2 } from "lucide-react";

interface QAContentProps {
  messages: StreamingMessage[];
  isLoading: boolean;
}

export function QAContent({ messages, isLoading }: QAContentProps) {
  return (
    <div className="space-y-4">
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
  );
}
