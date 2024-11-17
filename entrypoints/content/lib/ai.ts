let aiSession: any = null;

export async function ensureSession() {
  if (!aiSession) {
    aiSession = await ai.languageModel.create({
      systemPrompt: `You are a friendly, helpful AI assistant. You engage in natural conversations and provide helpful responses.
      - Provide detailed, relevant answers to questions
      - Be concise but informative
      - If asked about math, provide step-by-step explanations
      - If you don't know something, be honest about it`,
    });
  }
  return aiSession;
}

export async function sendMessage(message: string): Promise<string> {
  try {
    const session = await ensureSession();
    const result = await session.prompt(message);
    console.log(
      `Token usage: ${session.tokensSoFar}/${session.maxTokens} (${session.tokensLeft} left)`
    );
    return result;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}

export async function* sendMessageStreaming(
  message: string
): AsyncGenerator<string> {
  try {
    const session = await ensureSession();
    const stream = session.promptStreaming(message);

    for await (const chunk of stream) {
      yield chunk;
    }

    console.log(
      `Token usage: ${session.tokensSoFar}/${session.maxTokens} (${session.tokensLeft} left)`
    );
  } catch (error) {
    console.error("Error in sendMessageStreaming:", error);
    throw error;
  }
}

export async function sendMessageBatch(messages: string[]): Promise<string[]> {
  try {
    // Create the main session if it doesn't exist
    const mainSession = await ensureSession();

    // Create parallel requests using session clones
    const requests = messages.map(async (message) => {
      // Clone the session for each request
      const sessionClone = await mainSession.clone();

      const result = await sessionClone.prompt(message);
      console.log(
        `Token usage for batch request: ${sessionClone.tokensSoFar}/${sessionClone.maxTokens} (${sessionClone.tokensLeft} left)`
      );
      console.log(result);
      return result;
    });

    // Execute all requests in parallel
    return await Promise.all(requests);
  } catch (error) {
    console.error("Error in sendMessageBatch:", error);
    throw error;
  }
}
