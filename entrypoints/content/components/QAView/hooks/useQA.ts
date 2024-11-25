import { useState, useEffect, useRef, useCallback } from "react";
import { Message, Option } from "../../../types/chat";
import { useYTBTranscript } from "../../../hooks/useYTBTranscript";
import { chunkTranscript } from "../utils/transcriptChunker";
import {
  askShortAnswerQuestion,
  askSingleChoiceQuestion,
  evaluateAnswer,
} from "../utils/qaSession";
import {
  MAX_SINGLE_CHOICE_QUESTIONS,
  MAX_SHORT_ANSWER_QUESTIONS,
  INITIAL_QA_MESSAGE as INITIAL_MESSAGE,
  QAContextMessage,
} from "@/lib/constants";
import { ensureSession } from "@/entrypoints/content/lib/prompt";
import { getRandomString } from "@/entrypoints/content/lib/utils";

export function useQA() {
  const { YTBTranscript, isYTBTranscriptLoading, loadYTBTranscript } =
    useYTBTranscript();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = useRef(false);
  const [questionCount, setQuestionCount] = useState(0);
  const chunks = useRef<string[]>([]);
  const prevQuestion = useRef<string>("");
  const prevAnswer = useRef<string>("");
  const [singleChoiceCount, setSingleChoiceCount] = useState(0);

  useEffect(() => {
    loadYTBTranscript();
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
    if (
      isYTBTranscriptLoading ||
      !YTBTranscript?.length ||
      hasInitialized.current
    ) {
      return;
    }

    try {
      setIsLoading(true);
      const transcriptText = YTBTranscript.map((entry) => entry.text).join(
        "\n"
      );
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
  }, [YTBTranscript, isYTBTranscriptLoading, handleError]);

  useEffect(() => {
    if (
      YTBTranscript?.length &&
      !isYTBTranscriptLoading &&
      !hasInitialized.current
    ) {
      initializeQA();
    }
  }, [YTBTranscript, isYTBTranscriptLoading]);

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

      if (
        questionCount <
        MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS
      ) {
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

      if (singleChoiceCount < MAX_SINGLE_CHOICE_QUESTIONS - 1) {
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

        setSingleChoiceCount((prev) => prev + 1);
      } else {
        const { question, answer } = await askShortAnswerQuestion(
          getRandomString(chunks.current)
        );
        prevQuestion.current = question;
        prevAnswer.current = answer;

        setMessages((prev) => [
          ...prev,
          {
            content: question,
            sender: "ai",
            styleType: "blue",
          },
        ]);
      }

      if (
        questionCount <
        MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS
      ) {
        setQuestionCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error in handleOptionSelect:", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasReachedMaxQuestions =
    questionCount >= MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS;
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
