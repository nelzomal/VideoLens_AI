import { useState, useEffect, useRef, useCallback } from "react";
import { Option } from "../../../types/chat";
import { chunkTranscript } from "../utils/transcriptChunker";
import {
  askShortAnswerQuestion,
  askSingleChoiceQuestion,
  evaluateAnswer,
  QAState,
  QAStateManager,
  QAStateUpdate,
} from "../utils/qaSession";
import {
  MAX_SINGLE_CHOICE_QUESTIONS,
  MAX_SHORT_ANSWER_QUESTIONS,
  INITIAL_QA_MESSAGE as INITIAL_MESSAGE,
  QAContextMessage,
} from "@/lib/constants";
import { ensureSession } from "@/lib/prompt";
import { getRandomString } from "@/entrypoints/content/lib/utils";
import { usePersistedTranscript } from "@/entrypoints/content/hooks/usePersistedTranscript";

export function useQA() {
  const { transcript, isTranscriptLoading, loadYTBTranscript } =
    usePersistedTranscript();
  const [state, setState] = useState<QAState>({
    messages: [INITIAL_MESSAGE],
    questionCount: 0,
    singleChoiceCount: 0,
    prevQuestion: "",
    prevAnswer: "",
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const stateManager = useRef(
    new QAStateManager(
      state,
      { isInitialized: false, chunks: [] },
      (update: QAStateUpdate) => setState((prev) => ({ ...prev, ...update }))
    )
  ).current;

  useEffect(() => {
    loadYTBTranscript();
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      console.error("Error in QA session:", error);
      stateManager.appendMessage({
        content: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
      });
    },
    [stateManager]
  );

  const initializeQA = useCallback(async () => {
    if (
      isTranscriptLoading ||
      !transcript?.length ||
      stateManager.getSession().isInitialized
    ) {
      return;
    }

    try {
      setIsLoading(true);
      const transcriptText = transcript.map((entry) => entry.text).join("\n");
      await ensureSession(true, false, QAContextMessage);
      stateManager.setChunks(chunkTranscript(transcriptText));

      await askSingleChoiceQuestion(
        getRandomString(stateManager.getSession().chunks),
        stateManager
      );
      stateManager.incrementQuestionCount();
      stateManager.setSessionInitialized(true);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [transcript, isTranscriptLoading, handleError, stateManager]);

  useEffect(() => {
    if (
      transcript?.length &&
      !isTranscriptLoading &&
      !stateManager.getSession().isInitialized
    ) {
      initializeQA();
    }
  }, [transcript, isTranscriptLoading, initializeQA]);

  const handleSend = async (inputRef?: React.RefObject<HTMLInputElement>) => {
    if (!input.trim() || isLoading || !stateManager.getSession().isInitialized)
      return;

    setIsLoading(true);
    setInput("");

    try {
      stateManager.appendMessage({
        content: input.trim(),
        sender: "user",
      });

      const currentState = stateManager.getState();
      if (
        currentState.questionCount <=
        MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS
      ) {
        await evaluateAnswer(
          input,
          currentState.prevQuestion,
          currentState.prevAnswer,
          stateManager
        );
      }
      console.log(
        "Current question count:",
        currentState.questionCount,
        MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS
      );
      if (
        currentState.questionCount ===
        MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS
      ) {
        stateManager.appendMessage({
          sender: "ai",
          content:
            "Great! You've completed the initial questions. You can now ask questions freely about any part of the video!",
          styleType: "green",
        });
        stateManager.incrementQuestionCount();
        return;
      }

      if (
        currentState.questionCount >
        MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS
      ) {
        stateManager.appendMessage({
          content: "To be implemented",
          sender: "ai",
          styleType: "blue",
        });
        return;
      }

      await ensureSession(false, true, QAContextMessage);
      await askShortAnswerQuestion(
        getRandomString(stateManager.getSession().chunks),
        stateManager
      );

      if (!hasReachedMaxQuestions) {
        stateManager.incrementQuestionCount();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef?.current?.focus(), 0);
    }
  };

  const handleOptionSelect = async (option: Option) => {
    if (isLoading || !stateManager.getSession().isInitialized) return;

    setIsLoading(true);
    try {
      stateManager.appendMessage({
        content: option.isCorrect
          ? "Correct! Let's continue with the next question."
          : "That's not correct. Let's try another question.",
        sender: "ai",
        styleType: option.isCorrect ? "green" : "blue",
      });

      await ensureSession(false, true, QAContextMessage);

      stateManager.incrementSingleChoiceCount();
      const updatedState = stateManager.getState();

      if (updatedState.singleChoiceCount < MAX_SINGLE_CHOICE_QUESTIONS) {
        await askSingleChoiceQuestion(
          getRandomString(stateManager.getSession().chunks),
          stateManager
        );
      } else {
        await askShortAnswerQuestion(
          getRandomString(stateManager.getSession().chunks),
          stateManager
        );
      }

      if (!hasReachedMaxQuestions) {
        stateManager.incrementQuestionCount();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasReachedMaxQuestions =
    state.questionCount >=
    MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS;

  return {
    messages: state.messages,
    input,
    isLoading,
    setInput,
    handleSend,
    handleOptionSelect,
    isInitialized: stateManager.getSession().isInitialized,
    hasReachedMaxQuestions:
      state.questionCount >=
      MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS,
  };
}
