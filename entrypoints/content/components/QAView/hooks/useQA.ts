import { useState, useEffect, useRef, useCallback } from "react";
import { Message, Option } from "../../../types/chat";
import { useTranscript } from "../../../hooks/useTranscript";
import { chunkTranscript } from "../utils/transcriptChunker";
import {
  askShortAnswerQuestion,
  askSingleChoiceQuestion,
  evaluateAnswer,
} from "../utils/qaSession";
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

      const { question, options } = await askSingleChoiceQuestion({
        context: getRandomString(chunks.current),
      });
      prevQuestion.current = question;
      setMessages((prev) => [
        INITIAL_MESSAGE,
        {
          content: question,
          sender: "ai",
          styleType: "green",
        },
        {
          content: options,
          sender: "ai",
          styleType: "option",
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

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: `score: ${score}, explanation: ${explanation}`,
          sender: "ai",
          styleType: "green",
        },
      ]);

      await ensureSession(false, true, QAContextMessage);
      const { question, answer } = await askShortAnswerQuestion(
        getRandomString(chunks.current)
      );
      prevAnswer.current = answer;
      prevQuestion.current = question;
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: question,
          sender: "ai",
          styleType: "blue",
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

  const handleOptionSelect = async (option: Option) => {
    if (isLoading || !hasInitialized.current) {
      return;
    }

    setIsLoading(true);
    try {
      setMessages((prev) => [
        ...prev,
        {
          content: option.isCorrect
            ? "Correct! Let's continue with the next question."
            : "That's not correct. Let's try another question.",
          sender: "ai",
          styleType: option.isCorrect ? "green" : "blue",
        },
      ]);

      await ensureSession(false, true, QAContextMessage);

      const { question, options } = await askSingleChoiceQuestion({
        context: getRandomString(chunks.current),
      });

      prevQuestion.current = question;

      setMessages((prev) => [
        ...prev,
        {
          content: question,
          sender: "ai",
          styleType: "green",
        },
        {
          content: options,
          sender: "ai",
          styleType: "option",
        },
      ]);

      if (questionCount < MAX_QUESTIONS) {
        setQuestionCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error in handleOptionSelect:", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasReachedMaxQuestions = questionCount >= MAX_QUESTIONS;

  return {
    messages,
    input,
    isLoading,
    setInput,
    handleSend,
    handleOptionSelect,
    isInitialized: hasInitialized.current,
    hasReachedMaxQuestions,
  };
}
