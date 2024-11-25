import {
  MAX_PROMPT_INPUT_TOKENS,
  SYSTEM_PROMPT,
  MESSAGE_TRUNCATE_WORD_COUNTS,
  MAX_SYSTEM_PROMPT_TOKENS,
} from "@/lib/constants";
import { estimateTokens } from "./ai";

let aiSession: any = null;

export async function destroySession() {
  if (!aiSession) {
    return;
  }
  aiSession.destroy();
  aiSession = null;
}

export async function ensureSession(
  isNew: boolean = false,
  isClone: boolean = false,
  systemPrompt: string = SYSTEM_PROMPT
) {
  if (isNew) {
    await destroySession();
  }
  if (!aiSession) {
    const promptTokens = estimateTokens(systemPrompt);

    const finalSystemPrompt =
      promptTokens > MAX_SYSTEM_PROMPT_TOKENS
        ? systemPrompt.slice(0, MAX_SYSTEM_PROMPT_TOKENS * 4)
        : systemPrompt;
    console.log("final system prompt: ", finalSystemPrompt);
    aiSession = await ai.languageModel.create({
      systemPrompt: finalSystemPrompt,
    });
  }

  if (isClone) {
    return aiSession.clone();
  }
  return aiSession;
}

export async function sendMessage(
  message: string,
  isClone: boolean = false,
  maxTokens: number = MAX_PROMPT_INPUT_TOKENS
): Promise<string> {
  try {
    const session = await ensureSession(isClone);
    const estimatedTokens = await session.countPromptTokens(
      SYSTEM_PROMPT + message
    );
    console.log("estimatedTokens: ", estimatedTokens, message.length / 4);
    const processedMessage =
      estimatedTokens > maxTokens
        ? truncateMessage(message, maxTokens)
        : message;

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("API call timeout")), 30000);
    });

    const responsePromise = session.prompt(processedMessage);
    const result = await Promise.race([responsePromise, timeoutPromise]);

    if (typeof result !== "string") {
      throw new Error("Invalid response from API");
    }
    console.log(
      "isTruncated: ",
      estimatedTokens > maxTokens,
      estimatedTokens,
      maxTokens
    );
    console.log("processed message: ", processedMessage);
    console.log("result: ", result);
    console.log(
      `Token usage: ${session.tokensSoFar}/${session.maxTokens} (${session.tokensLeft} left)`
    );
    return result;
  } catch (error) {
    console.error("Error in sendMessage:", {
      error,
      messagePreview: message.substring(0, 100),
      errorType: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

function truncateMessage(
  message: string,
  maxTokens: number = MAX_PROMPT_INPUT_TOKENS
): string {
  if (message.length <= maxTokens) return message;

  const words = message.split(/\s+/);
  const { START, MIDDLE, END } = MESSAGE_TRUNCATE_WORD_COUNTS;

  if (words.length <= START + MIDDLE + END) {
    return message;
  }

  const start = words.slice(0, START).join(" ");
  const middle = words
    .slice(
      Math.floor(words.length / 2) - MIDDLE / 2,
      Math.floor(words.length / 2) + MIDDLE / 2
    )
    .join(" ");
  const end = words.slice(-END).join(" ");

  return `${start}\n\n[...]\n\n${middle}\n\n[...]\n\n${end}`;
}
