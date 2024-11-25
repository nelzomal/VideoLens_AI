import { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "../../../types/chat";
import { useTranscript } from "../../../hooks/useTranscript";
import { chunkTranscript } from "../utils/transcriptChunker";
import { createNextPrompt, INITIAL_QUESTION_PROMPT } from "../utils/qaPrompts";
import { askQuestion, evaluateAnswer } from "../utils/qaSession";
import {
  MAX_QUESTIONS,
  INITIAL_QA_MESSAGE as INITIAL_MESSAGE,
  QAContextMessage,
} from "@/lib/constants";
import { ensureSession } from "@/entrypoints/content/lib/prompt";
import { getRandomString } from "@/entrypoints/content/lib/utils";

export function useQA() {
  const { transcript, isTranscriptLoading, loadTranscript } = useTranscript();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = useRef(false);
  const [questionCount, setQuestionCount] = useState(0);
  const chunks = useRef<string[]>([]);
  const prevQuestion = useRef<string>("");
  const prevAnswer = useRef<string>("");

  useEffect(() => {
    loadTranscript();
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error("Error in handleSend:", error);
    setMessages((prev: Message[]) => [
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
      await ensureSession(true, false, QAContextMessage);
      chunks.current = chunkTranscript(transcriptText);

      const nextPrompt = createNextPrompt(getRandomString(chunks.current));
      const { question, answer } = await askQuestion(nextPrompt);
      prevAnswer.current = answer;
      prevQuestion.current = question;
      setMessages((prev) => [
        INITIAL_MESSAGE,
        {
          id: prev.length + 1,
          content: question,
          sender: "ai",
          type: "question",
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

  const handleSend = async (inputRef?: React.RefObject<HTMLInputElement>) => {
    if (!input.trim() || isLoading || !hasInitialized.current) return;

    setIsLoading(true);
    setInput("");

    try {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, content: input.trim(), sender: "user" },
      ]);

      const { score, explanation } = await evaluateAnswer(
        input,
        prevQuestion.current,
        prevAnswer.current
      );
      console.log("evaluateResult: ", score, explanation);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: `score: ${score}, explanation: ${explanation}`,
          sender: "ai",
          type: "explanation",
        },
      ]);

      await ensureSession(false, true, QAContextMessage);
      const nextPrompt = createNextPrompt(getRandomString(chunks.current));
      const { question, answer } = await askQuestion(nextPrompt);
      prevAnswer.current = answer;
      prevQuestion.current = question;
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: question,
          sender: "ai",
          type: "question",
        },
      ]);

      if (questionCount < MAX_QUESTIONS) {
        setQuestionCount((prev) => prev + 1);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef?.current?.focus();
      }, 0);
    }
  };

  const hasReachedMaxQuestions = questionCount >= MAX_QUESTIONS;

  return {
    messages,
    input,
    isLoading,
    setInput,
    handleSend,
    isInitialized: hasInitialized.current,
    hasReachedMaxQuestions,
  };
}
