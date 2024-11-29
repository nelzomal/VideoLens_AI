import { useState, useEffect, useRef, useCallback } from "react";
import { Option } from "../../../types/chat";
import {
  answerQuestion,
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
import {
  getEmbedding,
  getEmbeddings,
  getTop5SimilarEmbeddings,
  initializeExtractor,
  getContextFromEmbeddings,
} from "@/lib/rag";
import {
  getStoredQAState,
  storeQAState,
  getStoredEmbeddings,
  storeEmbeddings,
} from "@/lib/storage";
import { useVideoId } from "@/entrypoints/content/hooks/useVideoId";
import { EmbeddingData } from "@/entrypoints/content/types/rag";
import { chunkTranscript } from "../utils/transcriptChunker";

export function useQA(isActive: boolean) {
  const { transcript, isTranscriptLoading, loadYTBTranscript } =
    usePersistedTranscript();
  const [isAIThinking, setIsAIThinking] = useState<boolean>(true);
  const videoId = useVideoId();
  const [storedState, setStoredState] = useState<QAState>({
    messages: [],
    questionCount: 0,
    singleChoiceCount: 0,
    prevQuestion: "",
    prevAnswer: "",
  });
  console.log("storedState: ", storedState);
  const [input, setInput] = useState("");

  const stateManager = useRef<QAStateManager | null>(null);
  useEffect(() => {
    if (!videoId) return;
    setStoredState(getStoredQAState(videoId));
    stateManager.current = new QAStateManager(
      storedState,
      {
        isInitialized: storedState.messages.length > 0,
        chunks: [],
      },
      (update: QAStateUpdate) => {
        setStoredState((prev) => {
          const newState = { ...prev, ...update };
          storeQAState(videoId!, newState);
          return newState;
        });
      },
      videoId!
    );

    return () => {
      if (videoId && stateManager.current) {
        storeQAState(videoId, stateManager.current.getState());
      }
    };
  }, [videoId]);

  useEffect(() => {
    loadYTBTranscript();
    initializeExtractor();
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      console.error("Error in QA session:", error);
      stateManager.current?.appendMessage({
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
      !stateManager.current ||
      stateManager.current?.getSession().isInitialized ||
      !isActive
    ) {
      return;
    }

    try {
      setIsAIThinking(true);
      await ensureSession(true, false, QAContextMessage);

      const transcriptText = transcript.map((entry) => entry.text).join("\n");
      stateManager.current?.setChunks(chunkTranscript(transcriptText));
      let embeddings = getStoredEmbeddings(videoId!);

      if (!embeddings && transcript?.length > 0) {
        // Generate and store embeddings if not cached
        embeddings = await getEmbeddings(transcript);
        storeEmbeddings(videoId!, embeddings);
      }

      // Get chunks directly from state to avoid undefined
      const sessionChunks = stateManager.current.getSession().chunks;
      console.log("isAIThinking11: ", isAIThinking);
      await askSingleChoiceQuestion(
        getRandomString(sessionChunks), // Use chunks from state
        stateManager.current
      );

      stateManager.current.setSessionInitialized(true);
      setIsAIThinking(false);
      console.log("isAIThinking22: ", isAIThinking);
    } catch (error) {
      handleError(error);
    }
  }, [
    transcript,
    isTranscriptLoading,
    handleError,
    stateManager,
    isAIThinking,
  ]);

  useEffect(() => {
    if (
      transcript?.length &&
      !isTranscriptLoading &&
      !stateManager.current?.getSession().isInitialized
    ) {
      initializeQA();
    }
  }, [transcript, isTranscriptLoading, initializeQA]);

  const handleSend = async (inputRef?: React.RefObject<HTMLInputElement>) => {
    if (!input.trim() || !stateManager.current?.getSession().isInitialized)
      return;

    setInput("");

    try {
      setIsAIThinking(true);
      stateManager.current?.appendMessage({
        content: input.trim(),
        sender: "user",
      });

      const currentState = stateManager.current?.getState();
      if (
        currentState?.questionCount <=
        MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS
      ) {
        await evaluateAnswer(
          input,
          currentState?.prevQuestion,
          currentState?.prevAnswer,
          stateManager.current
        );
      }
      console.log(
        "Current question count:",
        currentState?.questionCount,
        MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS
      );
      if (
        currentState?.questionCount ===
        MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS
      ) {
        stateManager.current?.appendMessage({
          sender: "ai",
          content:
            "Great! You've completed the initial questions. You can now ask questions freely about any part of the video!",
          styleType: "green",
        });
        stateManager.current?.incrementQuestionCount();
        return;
      }

      if (
        currentState?.questionCount >
        MAX_SHORT_ANSWER_QUESTIONS + MAX_SINGLE_CHOICE_QUESTIONS
      ) {
        const embeddings = getStoredEmbeddings(videoId!);

        // Create a map for easier lookup of transcripts by index
        const indexToTranscriptMap = Object.assign(
          {},
          ...embeddings!.map((e: EmbeddingData) => ({
            [e.index]: e.transcript,
          }))
        );

        const top5Embeddings = await getTop5SimilarEmbeddings(
          await getEmbedding(input),
          embeddings!
        );

        // Get the top 2 most relevant chunks with surrounding context
        const relevantTop2Chunks = getContextFromEmbeddings(
          top5Embeddings.slice(0, 2),
          indexToTranscriptMap
        );

        const relevantBottom3Chunks = getContextFromEmbeddings(
          top5Embeddings.slice(2, 5),
          indexToTranscriptMap
        );

        // Combine the chunks into a single context
        const context = [...relevantTop2Chunks, ...relevantBottom3Chunks].join(
          "\n\n"
        );

        console.log("RAG Context:", context);

        await answerQuestion(input, context, stateManager.current);
        return;
      }

      await ensureSession(false, true, QAContextMessage);
      await askShortAnswerQuestion(
        getRandomString(stateManager.current?.getSession().chunks),
        stateManager.current
      );
    } catch (error) {
      handleError(error);
    } finally {
      setTimeout(() => inputRef?.current?.focus(), 0);
      setIsAIThinking(false);
    }
  };

  const handleOptionSelect = async (option: Option) => {
    console.log(
      "handleOptionSelect",
      option,
      stateManager.current?.getSession().isInitialized
    );
    if (!stateManager.current?.getSession().isInitialized) return;
    try {
      setIsAIThinking(true);
      stateManager.current?.appendMessage({
        content: option.isCorrect
          ? "Correct! Let's continue with the next question."
          : "That's not correct. Let's try another question.",
        sender: "ai",
        styleType: option.isCorrect ? "green" : "blue",
      });

      await ensureSession(false, true, QAContextMessage);

      stateManager.current?.incrementSingleChoiceCount();
      const updatedState = stateManager.current?.getState();

      if (updatedState?.singleChoiceCount < MAX_SINGLE_CHOICE_QUESTIONS) {
        await askSingleChoiceQuestion(
          getRandomString(stateManager.current?.getSession().chunks),
          stateManager.current
        );
      } else {
        await askShortAnswerQuestion(
          getRandomString(stateManager.current?.getSession().chunks),
          stateManager.current
        );
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsAIThinking(false);
    }
  };

  return {
    messages: storedState.messages,
    input,
    setInput,
    handleSend,
    handleOptionSelect,
    isAIThinking,
    isInitialized: stateManager.current?.getSession().isInitialized,
  };
}
