import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { StreamingMessage } from "../types/chat";
import { sendMessage, ensureSession } from "../lib/prompt";
import { useTranscript } from "../hooks/useTranscript";
import { useUrlChange } from "../hooks/useUrlChange";

export function QAView() {
  const { transcript } = useTranscript();
  const [messages, setMessages] = useState<StreamingMessage[]>([
    {
      id: 1,
      content: "Ask me questions about the video content!",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transcript.length > 0) {
      console.log("transcript: ", transcript);
      const transcriptText = transcript.map((entry) => entry.text).join("\n");
      const contextMessage = `you are an AI assistant to help test and reinforce my understanding of this video content. Please ask me questions about the material and help verify my comprehension.\nVideo Transcript:\n${transcriptText}`;
      ensureSession(false, contextMessage);
    }
  }, [transcript]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setIsLoading(true);
    setInput("");

    try {
      // Add user message
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, content: userMessage, sender: "user" },
      ]);

      // Get AI response
      const response = await sendMessage(userMessage);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: response,
          sender: "ai",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: "Sorry, I encountered an error. Please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset messages when URL changes
  useUrlChange(() => {
    setMessages([
      {
        id: 1,
        content: "Ask me questions about the video content!",
        sender: "ai",
      },
    ]);
    setInput("");
  });

  return (
    <div className="flex flex-col h-full p-4 text-white">
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

      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Ask a question about the video..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          className="flex-grow"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Ask
        </Button>
      </div>
    </div>
  );
}
