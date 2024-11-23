export function createNextPrompt(
  userInput: string,
  questionCount: number,
  chunks: string[],
  maxQuestions: number
): string {
  const currentChunk = chunks[questionCount] || chunks[0];

  return `Based on this transcript section: "${currentChunk}"

Evaluate the user's previous answer: "${userInput}"

Then, ask the next question about the content. Format your response exactly like this:
1. First, provide feedback on the user's previous answer
2. Then, ask your new question
3. Finally, provide the correct answer in this format: [ANSWER]: your answer here

Remember to keep the [ANSWER]: format consistent for parsing.`;
}

export const INITIAL_QUESTION_PROMPT =
  "Start by asking your first question about the video content. provide the answer in answer: **answer** format after the question.";
