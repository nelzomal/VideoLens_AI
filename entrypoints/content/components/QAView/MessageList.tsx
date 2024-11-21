import { StreamingMessage } from "../../types/chat";
import { ChatMessage } from "./ChatMessage";
import { ScrollContent } from "../common/ScrollContent";

interface MessageListProps {
  messages: StreamingMessage[];
  isLoading: boolean;
}

export const MessageList = ({ messages, isLoading }: MessageListProps) => (
  <ScrollContent className="space-y-0.5 flex-grow">
    {messages.map((message) => (
      <ChatMessage key={message.id} message={message} />
    ))}
    {isLoading && <div className="p-3 text-blue-400">AI is thinking...</div>}
  </ScrollContent>
);
