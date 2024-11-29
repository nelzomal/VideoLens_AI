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
import { RETRY_PROMPT_AI_COUNT } from "@/lib/constants";
import { sendMessage } from "@/lib/prompt";
import { storeQAState } from "@/lib/storage";
import { withRetry } from "@/lib/utils";

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
  private videoId: string;

  constructor(
    initialState: QAState,
    initialSession: QASession,
    setState: (update: QAStateUpdate) => void,
    videoId: string
  ) {
    this.state = { ...initialState };
    this.session = initialSession;
    this.setState = setState;
    this.videoId = videoId;

    console.log("QAStateManager: ", this.state);
  }

  appendMessage(newMessages: Message | Message[]) {
    const messagesToAdd = (
      Array.isArray(newMessages) ? newMessages : [newMessages]
    ).map((msg) => ({
      ...msg,
      id: Date.now() + Math.random(),
    }));

    this.state.messages = [...this.state.messages, ...messagesToAdd];

    this.setState({ messages: [...this.state.messages] });
  }

  incrementQuestionCount() {
    const newCount = this.state.questionCount + 1;

    this.state.questionCount = newCount;

    this.setState({ questionCount: newCount });
  }

  incrementSingleChoiceCount() {
    const newCount = this.state.singleChoiceCount + 1;

    this.state.singleChoiceCount = newCount;

    this.setState({ singleChoiceCount: newCount });
  }

  updateQuestion(question: string, answer?: string) {
    const update: QAStateUpdate = { prevQuestion: question };
    if (answer) {
      update.prevAnswer = answer;
    }

    this.state = {
      ...this.state,
      ...update,
    };

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

  public updateState(newState: QAState) {
    this.state = newState;
    storeQAState(this.videoId, this.state);
  }
}

export async function askShortAnswerQuestion(
  context: string,
  stateManager: QAStateManager
): Promise<void> {
  await withRetry(async () => {
    const aiResponse = await sendMessage(
      createShortAnswerQuestionPrompt(context),
      true
    );
    const parsed = parseShortAnswerQuestion(aiResponse);

    if (!parsed.question || !parsed.answer) {
      throw new QAError("Failed to parse short answer question response");
    }

    stateManager.updateQuestion(parsed.question, parsed.answer);
    stateManager.incrementQuestionCount();
    stateManager.appendMessage({
      content: parsed.question,
      sender: "ai",
      styleType: "blue",
    });
  }, RETRY_PROMPT_AI_COUNT);
}

export async function askSingleChoiceQuestion(
  context: string,
  stateManager: QAStateManager
): Promise<void> {
  const prompt = createSingleChoiceQuestionPrompt(context);

  await withRetry(async () => {
    const aiResponse = await sendMessage(prompt, true);
    const parsed = parseSingleChoiceQuestion(aiResponse);

    if (!parsed.question || !parsed.options) {
      throw new QAError("Invalid question format received");
    }

    const hasCorrectOption = parsed.options.some((option) => option.isCorrect);
    if (!hasCorrectOption) {
      throw new QAError("No correct option found in response");
    }

    const newMessages: Message[] = [
      {
        content: parsed.question,
        sender: "ai" as const,
        styleType: "green",
      },
      {
        content: parsed.options,
        sender: "ai" as const,
        styleType: "option",
      },
    ];

    stateManager.updateQuestion(parsed.question);
    stateManager.incrementQuestionCount();
    stateManager.appendMessage(newMessages);
  }, RETRY_PROMPT_AI_COUNT);
}

export async function evaluateAnswer(
  answer: string,
  prevQuestion: string,
  prevAnswer: string,
  stateManager: QAStateManager
): Promise<void> {
  await withRetry(async () => {
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
  }, RETRY_PROMPT_AI_COUNT);
}

export async function answerQuestion(
  question: string,
  context: string,
  stateManager: QAStateManager
): Promise<void> {
  await withRetry(async () => {
    const prompt = `answer the following question: "${question}" based on the following context: "${context}", provide a concise answer.`;
    const aiResponse = await sendMessage(prompt);

    stateManager.appendMessage({
      content: aiResponse,
      sender: "ai",
      styleType: "green",
    });
  }, RETRY_PROMPT_AI_COUNT);
}
