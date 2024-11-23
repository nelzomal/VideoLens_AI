import { useState, useEffect, useRef } from "react";
import { StreamingMessage } from "../../../types/chat";
import { sendMessage, ensureSession } from "../../../lib/prompt";
import { useTranscript } from "../../../hooks/useTranscript";
import { useUrlChange } from "../../../hooks/useUrlChange";

const INITIAL_MESSAGE: StreamingMessage = {
  id: 1,
  content:
    "I'll start asking you questions about the video content to test your understanding.",
  sender: "ai",
};

export function useQA() {
  const { transcript, isTranscriptLoading, loadTranscript } = useTranscript();
  const [messages, setMessages] = useState<StreamingMessage[]>([
    INITIAL_MESSAGE,
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    loadTranscript();
  }, [loadTranscript]);

  useEffect(() => {
    if (
      !isTranscriptLoading &&
      transcript &&
      transcript.length > 0 &&
      !hasInitialized.current
    ) {
      const transcriptText = transcript.map((entry) => entry.text).join("\n");

      const contextMessage = `you are an AI assistant to help test and reinforce understanding of this video content. Your role is to:
1. Ask questions about the video content one at a time
2. Wait for the user's answer
3. Provide feedback on their answer
4. Ask the next question

Important: You must start by asking a question about the content immediately. Do not wait for user input.

Video Transcript:
${transcriptText}`;

      const initializeQA = async () => {
        try {
          await ensureSession(false, contextMessage);
          setIsLoading(true);

          const firstQuestion = await sendMessage(
            "Start by asking your first question about the video content."
          );

          setMessages((prev) => [
            INITIAL_MESSAGE,
            {
              id: prev.length + 1,
              content: firstQuestion,
              sender: "ai",
            },
          ]);
          hasInitialized.current = true;
        } catch (error) {
          console.error("Error in initializeQA:", error);
        } finally {
          setIsLoading(false);
        }
      };

      initializeQA();
    }
  }, [transcript, isTranscriptLoading]);

  useUrlChange(() => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    hasInitialized.current = false;
  });

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

      const response = await sendMessage(
        `${userMessage}\n\nPlease provide feedback on my answer and ask the next question.`
      );

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: response,
          sender: "ai",
        },
      ]);
    } catch (error) {
      console.error("Error in handleSend:", error);
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

  return {
    messages,
    input,
    isLoading,
    setInput,
    handleSend,
  };
}
