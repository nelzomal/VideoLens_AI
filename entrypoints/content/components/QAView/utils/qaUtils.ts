import { Message, Option } from "../../../types/chat";

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
  question?: string;
  answer?: string;
  options?: Option[];
}

export function parseShortAnswerQuestion(content: string): ParsedQA {
  // First, split the content into question and answer parts
  const parts = content.split(/\*\*answer\*\*|\*\*answer:\*\*|answer:\s*\*\*/i);

  if (parts.length < 2) {
    // No answer marker found
    return {
      question: content.trim(),
      answer: undefined,
    };
  }

  const question = parts[0].trim();
  let answer = parts[1];

  // Remove any trailing asterisks from the answer
  answer = answer.replace(/\*\*$/, "");

  // For simple single-line answers with asterisks
  const simpleAnswerMatch = answer.match(/^\s*(.*?)\*\*$/);
  if (simpleAnswerMatch) {
    return {
      question: question.replace(/\n\s+/g, "\n"),
      answer: simpleAnswerMatch[1].trim(),
    };
  }

  // Split into paragraphs while preserving original formatting
  const paragraphs = answer.split(/\n\n+/);

  // Find where the next question starts
  const answerParagraphs = [];
  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    // Stop if we find a paragraph that looks like a new question
    // (starts with capital letter, not a numbered list, not "The ... are:")
    if (
      trimmedPara.match(/^[A-Z]/) &&
      !trimmedPara.match(/^\d+\./) &&
      !trimmedPara.match(/^The .* are:/) &&
      answerParagraphs.length !== 0
    ) {
      break;
    }
    answerParagraphs.push(para);
  }

  // Join paragraphs and clean up
  answer = answerParagraphs
    .join("\n\n")
    .split("\n")
    .map((line) => {
      // Preserve indentation for numbered lists
      if (line.match(/^\s*\d+\./)) {
        return line;
      }
      return line.trim();
    })
    .join("\n")
    .trim();

  return {
    question: question.replace(/\n\s+/g, "\n"),
    answer,
  };
}

export function parseSingleChoiceQuestion(response: string): ParsedQA {
  // Try different patterns for question
  const questionMatch = response.match(
    /question:\s*(?:\*\*)?\s*(.*?)(?:\s*\*\*)?(?=\s*options:|\s*$)/is
  );

  // Try different patterns for options
  const optionsMatch = response.match(
    /options:\s*((?:\*\*\s*[^*]+\s*\*\*(?:\s*[,|]\s*\*\*\s*[^*]+\s*\*\*)*)|(?:[^,|\n]+(?:\s*[,|]\s*[^,|\n]+)*))(?=\s*answer:|\s*$)/is
  );

  // Try different patterns for answer
  const answerMatch = response.match(
    /answer:\s*(?:\*\*)?\s*(.*?)(?:\s*\*\*)?$/i
  );

  let options: Option[] | undefined;
  let answer: string | undefined;

  if (optionsMatch) {
    const optionsText = optionsMatch[1].trim();
    let optionStrings: string[] = [];

    if (optionsText.includes("|")) {
      // For options separated by pipes
      optionStrings = optionsText
        .split("|")
        .map((opt) => opt.replace(/^\s*\*\*\s*|\s*\*\*\s*$/g, "").trim());
    } else if (optionsText.includes(",")) {
      // For comma-separated options
      optionStrings = optionsText
        .split(",")
        .map((opt) => opt.replace(/^\s*\*\*\s*|\s*\*\*\s*$/g, "").trim());
    } else {
      // For options separated by new lines or spaces
      optionStrings = optionsText
        .split(/\n+/)
        .map((opt) => opt.replace(/^\s*\*\*\s*|\s*\*\*\s*$/g, "").trim())
        .filter((opt) => opt.length > 0);
    }

    // Transform string array into Option array
    options = optionStrings.map((text) => ({
      text: text,
      isCorrect: false,
    }));
  }

  if (answerMatch) {
    const parsedAnswer = answerMatch[1]
      .replace(/^\s*\*\*\s*|\s*\*\*\s*$/g, "")
      .trim();
    // Only set the answer if it exists in the options or if there are no options
    if (!options || options.some((opt) => opt.text === parsedAnswer)) {
      answer = parsedAnswer;
      // Update isCorrect flag for the matching option
      if (options) {
        options = options.map((opt) => ({
          ...opt,
          isCorrect: opt.text === parsedAnswer,
        }));
      }
    }
  }

  const question = questionMatch
    ? questionMatch[1].replace(/^\s*\*\*\s*|\s*\*\*\s*$/g, "").trim()
    : undefined;

  return {
    question,
    answer,
    options,
  };
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
