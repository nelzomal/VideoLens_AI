import { Option } from "@/entrypoints/content/types/chat";
import { sendMessage, ensureSession } from "../../../lib/prompt";
import {
  createShortAnswerQuestionPrompt,
  createSingleChoiceQuestionPrompt,
} from "./qaPrompts";
import {
  ParsedEvaluation,
  parseEvaluation,
  parseShortAnswerQuestion,
  parseSingleChoiceQuestion,
} from "./qaUtils";

export async function askShortAnswerQuestion(
  context: string
): Promise<{ question: string; answer: string }> {
  const aiResponse = await sendMessage(
    createShortAnswerQuestionPrompt(context),
    true
  );
  const parsed = parseShortAnswerQuestion(aiResponse);
  if (!parsed.question || !parsed.answer) {
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

export async function askSingleChoiceQuestion({
  context,
}: {
  context: string;
}): Promise<{ question: string; options: Option[] }> {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      const aiResponse = await sendMessage(
        createSingleChoiceQuestionPrompt(context),
        true
      );
      const parsed = parseSingleChoiceQuestion(aiResponse);
      console.log("parsed:", aiResponse, parsed);
      if (parsed.question && parsed.options) {
        const hasCorrectOption = parsed.options.some(
          (option) => option.isCorrect
        );
        if (hasCorrectOption) {
          return {
            question: parsed.question,
            options: parsed.options,
          };
        }
      }

      attempts++;
      if (attempts === maxAttempts) {
        throw new Error(
          "Failed to generate valid question and options after retries"
        );
      }
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error("Failed to generate question");
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
