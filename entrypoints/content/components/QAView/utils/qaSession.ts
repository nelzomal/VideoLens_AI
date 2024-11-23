import { StreamingMessage } from "../../../types/chat";
import { sendMessage, ensureSession } from "../../../lib/prompt";
import { parseQuestionAndAnswer } from "./qaUtils";
import { createQAContextMessage } from "@/lib/constants";

interface QAResponse {
  question: string;
  answer: string;
}

export async function initializeQASession(
  transcriptChunks: string[],
  initialMessage: StreamingMessage
): Promise<QAResponse> {
  const contextMessage = createQAContextMessage(transcriptChunks[0]);
  await ensureSession(false, contextMessage);

  const response = await sendMessage(
    "Start by asking your first question about the video content. provide the answer in answer: **answer** format after the question."
  );

  const parsed = parseQuestionAndAnswer(response);

  if (!parsed.answer) {
    throw new Error("Failed to parse answer from response");
  }

  return {
    question: parsed.question,
    answer: parsed.answer,
  };
}

export async function handleQAMessage(
  userMessage: string,
  prompt: string
): Promise<string> {
  return await sendMessage(prompt);
}
