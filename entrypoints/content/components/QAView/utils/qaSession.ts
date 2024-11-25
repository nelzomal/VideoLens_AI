import { sendMessage, ensureSession } from "../../../lib/prompt";
import {
  ParsedEvaluation,
  ParsedQA,
  parseEvaluation,
  parseQuestionAndAnswer,
} from "./qaUtils";

export async function askQuestion(
  nextPrompt: string
): Promise<{ question: string; answer: string }> {
  const aiResponse = await sendMessage(nextPrompt, true);
  const parsed = parseQuestionAndAnswer(aiResponse);
  console.log("parsed: ", parsed);
  if (!parsed.question || !parsed.answer) {
    // If parsing fails, use the entire response as the question
    // and provide a default answer
    return {
      question: aiResponse,
      answer: "No specific answer format was provided.",
    };
  }

  return {
    question: parsed.question,
    answer: parsed.answer,
  };
}

export async function evaluateAnswer(
  answer: string,
  prevQuestion: string,
  prevAnswer: string
): Promise<ParsedEvaluation> {
  const prompt = `evaluate the following user answer: "${answer}", provide a score for the user answer between 0 and 100. and a brief explanation for the score.
   in the following format: score: **score**, explanation: **explanation**`;
  const aiResponse = await sendMessage(prompt);
  const parsed = parseEvaluation(aiResponse);
  return parsed;
}
