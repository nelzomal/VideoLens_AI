import { StreamingMessage } from "../../../types/chat";

export function createMessage(
  content: string,
  sender: "user" | "ai",
  id: number
): StreamingMessage {
  return {
    id,
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
    /\*\*answer\*\*\s*([\s\S]*?)(?=\n\n|$)/i
  );
  const answerHeaderColonMatch = content.match(
    /\*\*answer:\*\*\s*([\s\S]*?)(?=\n\n|$)/i
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
