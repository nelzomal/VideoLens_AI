import { Message } from "../../../types/chat";

export function createMessage(
  content: string,
  sender: "user" | "ai",
  id: number
): Message {
  return {
    content,
    sender,
  };
}

export interface ParsedQA {
  question: string;
  answer?: string;
}

export function parseQuestionAndAnswer(content: string): ParsedQA {
  // Try all patterns: "answer: **text**", "**answer**\ntext", and "**answer:**\ntext"
  const answerColonMatch = content.match(/answer:\s*\*\*(.*?)\*\*/i);
  const answerHeaderMatch = content.match(
    /\*\*answer\*\*\s*([\s\S]*?)(?=\n\n(?!\d\.|\*)[A-Z]|$)/i
  );
  const answerHeaderColonMatch = content.match(
    /\*\*answer:\*\*\s*([\s\S]*?)(?=\n\n(?!\d\.|\*)[A-Z]|$)/i
  );

  let answer: string | undefined;
  let question: string;

  if (answerColonMatch) {
    // Handle "answer: **text**" pattern
    answer = answerColonMatch[1];
    const parts = content.split(/answer:\s*\*\*.*?\*\*/i);
    question = parts[0].trim();
  } else if (answerHeaderColonMatch) {
    // Handle "**answer:**\ntext" pattern
    answer = answerHeaderColonMatch[1].trim();
    const parts = content.split(/\*\*answer:\*\*/i);
    question = parts[0].trim();
  } else if (answerHeaderMatch) {
    // Handle "**answer**\ntext" pattern
    answer = answerHeaderMatch[1].trim();
    const parts = content.split(/\*\*answer\*\*/i);
    question = parts[0].trim();
  } else {
    // No answer found
    question = content.trim();
  }

  return { question, answer };
}

export interface ParsedEvaluation {
  score: number;
  explanation: string;
}

export function parseEvaluation(content: string): ParsedEvaluation {
  // Match pattern "score: X" where X is a number
  const scoreMatch = content.match(/score:\s*(\d+)/i);

  // Match pattern "explanation: text" until the end of string
  const explanationMatch = content.match(/explanation:\s*([\s\S]+)$/i);

  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
  const explanation = explanationMatch ? explanationMatch[1].trim() : "";

  return { score, explanation };
}
