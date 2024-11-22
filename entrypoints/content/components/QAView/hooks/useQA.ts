import { useState, useEffect } from "react";
import { StreamingMessage } from "../../../types/chat";
import { sendMessage, ensureSession } from "../../../lib/prompt";
import { useTranscript } from "../../../hooks/useTranscript";
import { useUrlChange } from "../../../hooks/useUrlChange";

const INITIAL_MESSAGE: StreamingMessage = {
  id: 1,
  content: "Ask me questions about the video content!",
  sender: "ai",
};

export function useQA() {
  const { transcript } = useTranscript();
  const [messages, setMessages] = useState<StreamingMessage[]>([
    INITIAL_MESSAGE,
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transcript.length > 0) {
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
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, content: userMessage, sender: "user" },
      ]);

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

  useUrlChange(() => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  });

  return {
    messages,
    input,
    isLoading,
    setInput,
    handleSend,
  };
}
