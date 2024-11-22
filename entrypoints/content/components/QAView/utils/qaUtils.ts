import { StreamingMessage } from "../../../types/chat";

export function createMessage(
  content: string,
  sender: "user" | "ai",
  id: number
): StreamingMessage {
  return {
    id,
    content,
    sender,
  };
}
