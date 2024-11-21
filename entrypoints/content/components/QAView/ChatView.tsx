"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChatMessage } from "./ChatMessage";
import { StreamingMessage } from "../../types/chat";
import {
  sendMessage,
  sendMessageBatch,
  sendMessageStreaming,
} from "../../lib/ai";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ChatView() {
  const [messages, setMessages] = useState<StreamingMessage[]>([
    { id: 1, content: "Hello! How can I assist you today?", sender: "ai" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

      if (isStreaming) {
        await handleStreamingResponse(userMessage);
      } else {
        await handleNormalResponse(userMessage);
      }
    } catch (error) {
      handleError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamingResponse = async (userMessage: string) => {
    let streamingMessageId: number;
    setMessages((prev) => {
      streamingMessageId = prev.length + 1;
      return [
        ...prev,
        {
          id: streamingMessageId,
          content: "",
          sender: "ai",
          isStreaming: true,
        },
      ];
    });

    let fullResponse = "";
    for await (const chunk of sendMessageStreaming(userMessage)) {
      fullResponse += chunk;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? { ...msg, content: fullResponse }
            : msg
        )
      );
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === streamingMessageId
          ? { id: msg.id, content: fullResponse, sender: "ai" }
          : msg
      )
    );
  };

  const handleNormalResponse = async (userMessage: string) => {
    const response = await sendMessage(userMessage);
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: response,
        sender: "ai",
      },
    ]);
  };

  const handleError = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[500px] max-w-xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 bg-black p-2 rounded-md">
          <Switch
            id="streaming-mode"
            checked={isStreaming}
            onCheckedChange={setIsStreaming}
            className="ml-2 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
            aria-label="Toggle streaming mode"
          />
          <Label
            htmlFor="streaming-mode"
            className="text-sm font-medium text-white"
          >
            {isStreaming ? "Streaming Mode" : "At Once Mode"}
          </Label>
        </div>
      </div>

      <ScrollArea className="flex-grow mb-4 border rounded-md p-3">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && !isStreaming && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start">
              <Avatar className="w-8 h-8">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="mx-2 p-3 rounded-lg bg-gray-200">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </ScrollArea>

      <div className="flex items-center">
        <Input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          className="flex-grow mr-2"
          disabled={isLoading}
        />
        <Button onClick={handleSend} className="px-4" disabled={isLoading}>
          <Send className={`w-4 h-4 ${isLoading ? "opacity-50" : ""}`} />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
