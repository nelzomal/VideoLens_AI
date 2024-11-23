import { StreamingMessage } from "../../../types/chat";
import { sendMessage, ensureSession } from "../../../lib/prompt";
import { ParsedQA, parseQuestionAndAnswer } from "./qaUtils";
import { createQAContextMessage } from "@/lib/constants";

export async function initializeQASession(
  transcriptChunks: string[]
): Promise<ParsedQA> {
  const contextMessage = createQAContextMessage(transcriptChunks[0]);
  await ensureSession(false, contextMessage);

  const response = await sendMessage(
    "Start by asking your first question about the video content. provide the answer in answer: **answer** format after the question."
  );

  const parsed = parseQuestionAndAnswer(response);

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
