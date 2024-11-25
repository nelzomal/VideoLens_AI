export interface Message {
  content: string;
  sender: "user" | "ai";
  isStreaming?: boolean;
  type?: "question" | "explanation" | "other";
}
