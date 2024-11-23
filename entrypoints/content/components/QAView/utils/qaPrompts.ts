export function createNextPrompt(
  userMessage: string,
  currentQuestionCount: number,
  chunks: string[],
  maxQuestions: number
): string {
  if (currentQuestionCount >= maxQuestions) {
    return `${userMessage}\n\nProvide feedback on my answer. This was the final question, so please conclude the session with a summary of performance.`;
  }

  return `${userMessage}

Provide feedback on my answer, then ask a new question about this content:

${chunks[currentQuestionCount]}

Remember to provide the answer in answer: **answer** format after the question.`;
}

export const INITIAL_QUESTION_PROMPT =
  "Start by asking your first question about the video content. provide the answer in answer: **answer** format after the question.";
