export function createShortAnswerQuestionPrompt(context: string): string {
  return `Based on this transcript section: "${context}" \n
    Ask your question about the video content. provide the answer in answer: **answer** format after the question.`;
}

export const INITIAL_QUESTION_PROMPT =
  "Start by asking your first question about the video content. provide the answer in answer: **answer** format after the question.";

export function createSingleChoiceQuestionPrompt(context: string): string {
  return `Based on this context: "${context}", create a single choice question with 4 options. 
  Format your response as follows:
  question: **your question here**
  options: **some text**|**some text**|**some text**|**some text**
  answer: **correct option here**`;
}
