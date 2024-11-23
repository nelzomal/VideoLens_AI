import { useState, useEffect, useRef, useCallback } from "react";
import { StreamingMessage } from "../../../types/chat";
import { useTranscript } from "../../../hooks/useTranscript";
import {
  chunkTranscript,
  selectRandomChunks,
} from "../utils/transcriptChunker";
import { createNextPrompt, INITIAL_QUESTION_PROMPT } from "../utils/qaPrompts";
import { initializeQASession, handleQAMessage } from "../utils/qaSession";
import {
  MAX_QUESTIONS,
  INITIAL_QA_MESSAGE as INITIAL_MESSAGE,
} from "@/lib/constants";

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

  useEffect(() => {
    loadTranscript();
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error("Error in handleSend:", error);
    setMessages((prev: StreamingMessage[]) => [
      ...prev,
      {
        id: prev.length + 1,
        content: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
      },
    ]);
  }, []);

  const initializeQA = useCallback(async () => {
    if (isTranscriptLoading || !transcript?.length || hasInitialized.current) {
      return;
    }

    try {
      setIsLoading(true);
      const transcriptText = transcript.map((entry) => entry.text).join("\n");
      const chunks = chunkTranscript(transcriptText);
      selectedChunks.current = selectRandomChunks(chunks, MAX_QUESTIONS);

      const { question, answer } = await initializeQASession(
        selectedChunks.current,
        INITIAL_MESSAGE
      );

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
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [transcript, isTranscriptLoading, handleError]);

  useEffect(() => {
    if (transcript?.length && !isTranscriptLoading && !hasInitialized.current) {
      initializeQA();
    }
  }, [transcript, isTranscriptLoading]);

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

      const nextPrompt = createNextPrompt(
        userMessage,
        questionCount,
        selectedChunks.current,
        MAX_QUESTIONS
      );
      const response = await handleQAMessage(userMessage, nextPrompt);

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
      handleError(error);
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
