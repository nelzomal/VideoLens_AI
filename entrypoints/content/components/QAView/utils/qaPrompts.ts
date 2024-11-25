export function createNextPrompt(currentChunk: string): string {
  return `Based on this transcript section: "${currentChunk}" \n
    Ask your question about the video content. provide the answer in answer: **answer** format after the question.`;
}

export const INITIAL_QUESTION_PROMPT =
  "Start by asking your first question about the video content. provide the answer in answer: **answer** format after the question.";
