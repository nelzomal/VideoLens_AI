export interface Message {
  content: string | Option[];
  sender: "user" | "ai";
  isStreaming?: boolean;
  styleType?: "green" | "option" | "default";
}

export interface Option {
  text: string;
  isCorrect: boolean;
}
