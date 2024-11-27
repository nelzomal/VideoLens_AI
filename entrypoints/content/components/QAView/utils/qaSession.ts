import { Option, Message } from "@/entrypoints/content/types/chat";
import {
  createShortAnswerQuestionPrompt,
  createSingleChoiceQuestionPrompt,
} from "./qaPrompts";
import {
  parseEvaluation,
  parseShortAnswerQuestion,
  parseSingleChoiceQuestion,
} from "./qaUtils";
import { RETRY_GENERATE_QUESTION_COUNT } from "@/lib/constants";
import { sendMessage } from "@/lib/prompt";

export interface QAState {
  messages: Message[];
  questionCount: number;
  singleChoiceCount: number;
  prevQuestion: string;
  prevAnswer: string;
}

export interface QASession {
  isInitialized: boolean;
  chunks: string[];
}

interface ShortAnswerResponse {
  question: string;
  answer: string;
}

interface SingleChoiceResponse {
  question: string;
  options: Option[];
}

export interface QAStateUpdate {
  messages?: Message[];
  questionCount?: number;
  singleChoiceCount?: number;
  prevQuestion?: string;
  prevAnswer?: string;
}

class QAError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QAError";
  }
}

export class QAStateManager {
  private state: QAState;
  private session: QASession;
  private setState: (update: QAStateUpdate) => void;

  constructor(
    initialState: QAState,
    initialSession: QASession,
    setState: (update: QAStateUpdate) => void
  ) {
    this.state = { ...initialState };
    this.session = initialSession;
    this.setState = setState;
  }

  appendMessage(newMessages: Message | Message[]) {
    // Create a new array with all messages
    const messagesToAdd = (
      Array.isArray(newMessages) ? newMessages : [newMessages]
    ).map((msg) => ({
      ...msg,
      id: Date.now() + Math.random(),
    }));

    // Update internal state first
    this.state.messages = [...this.state.messages, ...messagesToAdd];

    // Then call setState
    this.setState({ messages: [...this.state.messages] });
  }

  incrementQuestionCount() {
    const newCount = this.state.questionCount + 1;

    // Update internal state
    this.state.questionCount = newCount;

    // Then call setState
    this.setState({ questionCount: newCount });
  }

  incrementSingleChoiceCount() {
    const newCount = this.state.singleChoiceCount + 1;

    // Update internal state
    this.state.singleChoiceCount = newCount;

    // Then call setState
    this.setState({ singleChoiceCount: newCount });
  }

  updateQuestion(question: string, answer?: string) {
    const update: QAStateUpdate = { prevQuestion: question };
    if (answer) {
      update.prevAnswer = answer;
    }

    // Update internal state
    this.state = {
      ...this.state,
      ...update,
    };

    // Then call setState
    this.setState(update);
  }

  getState() {
    return { ...this.state };
  }

  getSession() {
    return this.session;
  }

  setSessionInitialized(initialized: boolean) {
    this.session.isInitialized = initialized;
  }

  setChunks(chunks: string[]) {
    this.session.chunks = chunks;
  }
}

export async function askShortAnswerQuestion(
  context: string,
  stateManager: QAStateManager
): Promise<void> {
  const maxAttempts = RETRY_GENERATE_QUESTION_COUNT;

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    try {
      const aiResponse = await sendMessage(
        createShortAnswerQuestionPrompt(context),
        true
      );
      const parsed = parseShortAnswerQuestion(aiResponse);

      if (!parsed.question || !parsed.answer) {
        throw new QAError("Failed to parse short answer question response");
      }

      stateManager.updateQuestion(parsed.question, parsed.answer);
      stateManager.appendMessage({
        content: parsed.question,
        sender: "ai",
        styleType: "blue",
      });

      return;
    } catch (error) {
      if (attempts === maxAttempts - 1) {
        throw new QAError(
          "Failed to generate valid short answer question after maximum retries"
        );
      }
    }
  }

  throw new QAError("Failed to generate question");
}

export async function askSingleChoiceQuestion(
  context: string,
  stateManager: QAStateManager
): Promise<void> {
  const maxAttempts = RETRY_GENERATE_QUESTION_COUNT;

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    try {
      const aiResponse = await sendMessage(
        createSingleChoiceQuestionPrompt(context),
        true
      );
      const parsed = parseSingleChoiceQuestion(aiResponse);

      if (!parsed.question || !parsed.options) {
        throw new QAError("Invalid question format received");
      }

      const hasCorrectOption = parsed.options.some(
        (option) => option.isCorrect
      );

      if (!hasCorrectOption) {
        throw new QAError("No correct option found in response");
      }

      // Send both messages in a single update with correct types
      const newMessages: Message[] = [
        {
          content: parsed.question,
          sender: "ai" as const, // explicitly type as "ai"
          styleType: "green",
        },
        {
          content: parsed.options,
          sender: "ai" as const, // explicitly type as "ai"
          styleType: "option",
        },
      ];

      stateManager.updateQuestion(parsed.question);
      stateManager.appendMessage(newMessages);

      return;
    } catch (error) {
      if (attempts === maxAttempts - 1) {
        throw new QAError(
          "Failed to generate valid question and options after maximum retries"
        );
      }
    }
  }

  throw new QAError("Failed to generate question");
}

export async function evaluateAnswer(
  answer: string,
  prevQuestion: string,
  prevAnswer: string,
  stateManager: QAStateManager
): Promise<void> {
  try {
    const prompt = `evaluate the following user answer: "${answer}", provide a score for the user answer between 0 and 100. and a brief explanation for the score.
     in the following format: score: **score**, explanation: **explanation**`;

    const aiResponse = await sendMessage(prompt);
    const parsed = parseEvaluation(aiResponse);

    if (!parsed || typeof parsed.score !== "number" || !parsed.explanation) {
      throw new QAError("Invalid evaluation format received");
    }

    stateManager.appendMessage({
      content: `score: ${parsed.score}, explanation: ${parsed.explanation}`,
      sender: "ai",
      styleType: "green",
    });
  } catch (error) {
    console.error("Error in evaluateAnswer:", error);
    throw new QAError(
      error instanceof Error ? error.message : "Failed to evaluate answer"
    );
  }
}
