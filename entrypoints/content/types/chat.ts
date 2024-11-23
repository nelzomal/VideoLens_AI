export type Message = {
  id: number;
  content: string;
  isStreaming?: boolean;
  sender: "user" | "ai";
};

export type StreamingMessage = Message & {
  answer?: string;
};
