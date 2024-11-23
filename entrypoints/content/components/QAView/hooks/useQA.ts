import { useState, useEffect, useRef, useCallback } from "react";
import { StreamingMessage } from "../../../types/chat";
import { sendMessage, ensureSession } from "../../../lib/prompt";
import { useTranscript } from "../../../hooks/useTranscript";
import { useUrlChange } from "../../../hooks/useUrlChange";
import { parseQuestionAndAnswer } from "../utils/qaUtils";
import { MAX_TRANSCRIPT_LENGTH } from "@/lib/constants";

const INITIAL_MESSAGE: StreamingMessage = {
  id: 1,
  content:
    "I'll start asking you questions about the video content to test your understanding.",
  sender: "ai",
};

const MAX_QUESTIONS = 5;

export function useQA() {
  const { transcript, isTranscriptLoading, loadTranscript } = useTranscript();
  const [messages, setMessages] = useState<StreamingMessage[]>([
    INITIAL_MESSAGE,
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = useRef(false);
  const [questionCount, setQuestionCount] = useState(0);
  const selectedChunks = useRef<string[]>([]);

  // Load transcript on mount
  useEffect(() => {
    loadTranscript();
  }, []);

  // Initialize QA session when transcript is ready
  const initializeQA = useCallback(async () => {
    if (isTranscriptLoading || !transcript?.length || hasInitialized.current) {
      return;
    }

    try {
      setIsLoading(true);

      const transcriptText = transcript.map((entry) => entry.text).join("\n");
      let transcriptChunks: string[] = [];

      if (transcriptText.length > MAX_TRANSCRIPT_LENGTH) {
        // Split text into sentences (basic implementation)
        const sentences = transcriptText.split(/[.!?]+\s+/);
        let currentChunk = "";
        let lastSentence = "";

        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > MAX_TRANSCRIPT_LENGTH) {
            if (currentChunk) {
              transcriptChunks.push(currentChunk);
            }
            currentChunk = lastSentence + sentence;
          } else {
            currentChunk += (currentChunk ? " " : "") + sentence;
          }
          lastSentence = sentence;
        }

        if (currentChunk) {
          transcriptChunks.push(currentChunk);
        }
      } else {
        transcriptChunks = [transcriptText];
      }

      // Randomly select chunks if there are more than needed
      const shuffledChunks = [...transcriptChunks].sort(
        () => Math.random() - 0.5
      );
      selectedChunks.current = shuffledChunks.slice(
        0,
        Math.min(MAX_QUESTIONS, shuffledChunks.length)
      );

      const contextMessage = `you are an AI assistant to help test and reinforce understanding of this video content. Your role is to:
1. Ask ONE question about the video content and provide the answer in answer: **answer** format after the question.
2. Wait for the user's answer
3. Provide feedback on their answer
4. When prompted, ask the next question about a different part of the content

Important: You must start by asking a question about the content immediately. Do not wait for user input.

Video Content Chunk:
${selectedChunks.current[0]}`;

      await ensureSession(false, contextMessage);

      const response = await sendMessage(
        "Start by asking your first question about the video content. provide the answer in answer: **answer** format after the question."
      );

      const { question, answer } = parseQuestionAndAnswer(response);

      setMessages((prev) => [
        INITIAL_MESSAGE,
        {
          id: prev.length + 1,
          content: question,
          sender: "ai",
          answer,
        },
      ]);

      setQuestionCount(1);
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

      let nextPrompt = "";
      if (questionCount < MAX_QUESTIONS) {
        const nextChunkIndex = questionCount;
        nextPrompt = `${userMessage}

Provide feedback on my answer, then ask a new question about this content:

${selectedChunks.current[nextChunkIndex]}

Remember to provide the answer in answer: **answer** format after the question.`;
      } else {
        nextPrompt = `${userMessage}

Provide feedback on my answer. This was the final question, so please conclude the session with a summary of performance.`;
      }

      const response = await sendMessage(nextPrompt);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: response,
          sender: "ai",
        },
      ]);

      if (questionCount < MAX_QUESTIONS) {
        setQuestionCount((prev) => prev + 1);
      }
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
    isInitialized: hasInitialized.current,
  };
}
