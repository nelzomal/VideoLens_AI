import { StreamingMessage } from "../../types/chat";

interface ChatMessageProps {
  message: StreamingMessage;
}

export const ChatMessage = ({ message }: ChatMessageProps) => (
  <div className="flex flex-col p-3 hover:bg-gray-800 transition-colors duration-150">
    <div className="flex gap-6">
      <span className="text-[#3ea6ff] font-medium min-w-[52px]">
        {message.sender === "ai" ? "AI" : "You"}
      </span>
      <span className="text-gray-100">{message.content}</span>
    </div>
  </div>
);
