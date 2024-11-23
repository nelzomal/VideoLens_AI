import { useState, useEffect, useRef, useCallback } from "react";
import { StreamingMessage } from "../../../types/chat";
import { sendMessage, ensureSession } from "../../../lib/prompt";
import { useTranscript } from "../../../hooks/useTranscript";
import { useUrlChange } from "../../../hooks/useUrlChange";
import { parseQuestionAndAnswer } from "../utils/qaUtils";

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

  // Load transcript on mount
  useEffect(() => {
    console.log("Loading transcript...");
    loadTranscript();
  }, []);

  // Initialize QA session when transcript is ready
  const initializeQA = useCallback(async () => {
    console.log("Initializing QA...", {
      isTranscriptLoading,
      hasTranscript: transcript?.length > 0,
      hasInitialized: hasInitialized.current,
    });

    if (isTranscriptLoading || !transcript?.length || hasInitialized.current) {
      return;
    }

    try {
      setIsLoading(true);
      const transcriptText = transcript.map((entry) => entry.text).join("\n");

      const contextMessage = `you are an AI assistant to help test and reinforce understanding of this video content. Your role is to:
1. Ask questions about the video content one at a time and also provide the answer in answer: **answer** format after the question.
2. Wait for the user's answer
3. Provide feedback on their answer
4. Ask the next question

Important: You must start by asking a question about the content immediately. Do not wait for user input.

Video Transcript:
${transcriptText}`;

      console.log("Setting up session...");
      await ensureSession(false, contextMessage);

      console.log("Sending first message...");
      const response = await sendMessage(
        "Start by asking your first question about the video content. provide the answer in answer: **answer** format after the question."
      );

      console.log("Parsing response:", response);
      const { question, answer } = parseQuestionAndAnswer(response);
      console.log("Parsed Q&A:", { question, answer });

      setMessages((prev) => [
        INITIAL_MESSAGE,
        {
          id: prev.length + 1,
          content: question,
          sender: "ai",
          answer,
        },
      ]);

      hasInitialized.current = true;
    } catch (error) {
      console.error("Error in initializeQA:", error);
    } finally {
      setIsLoading(false);
    }
  }, [transcript, isTranscriptLoading]);

  // Run initialization when transcript changes
  useEffect(() => {
    if (!hasInitialized.current) {
      initializeQA();
    }
  }, [initializeQA]);

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
