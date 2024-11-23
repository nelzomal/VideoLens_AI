export type Message = {
  id: number;
  content: string;
  sender: "user" | "ai";
};

export type StreamingMessage = Message & {
  answer?: string;
};
