import { useState, useEffect } from "react";
import { StreamingMessage } from "../../types/chat";
import { sendMessage, ensureSession } from "../../lib/prompt";
import { useTranscript } from "../../hooks/useTranscript";
import { useUrlChange } from "../../hooks/useUrlChange";
import { Header } from "./Header";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ScrollContent } from "../common/ScrollContent";

const INITIAL_MESSAGE: StreamingMessage = {
  id: 1,
  content:
    "I'll start asking you questions about the video content to test your understanding.",
  sender: "ai",
};

export function QAView() {
  const { transcript, isTranscriptLoading, loadTranscript } = useTranscript();
  const [messages, setMessages] = useState<StreamingMessage[]>([
    INITIAL_MESSAGE,
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Component mounted, loading transcript...");
    loadTranscript();
  }, [loadTranscript]);

  useEffect(() => {
    console.log("Transcript loading state:", isTranscriptLoading);
    console.log("Current transcript:", transcript);
    console.log("Transcript length:", transcript?.length);

    if (!isTranscriptLoading && transcript && transcript.length > 0) {
      const transcriptText = transcript.map((entry) => entry.text).join("\n");
      console.log(
        "Got transcript text:",
        transcriptText.substring(0, 100) + "..."
      );

      const contextMessage = `you are an AI assistant to help test and reinforce understanding of this video content. Your role is to:
1. Ask questions about the video content one at a time
2. Wait for the user's answer
3. Provide feedback on their answer
4. Ask the next question

Important: You must start by asking a question about the content immediately. Do not wait for user input.

Video Transcript:
${transcriptText}`;

      const initializeQA = async () => {
        console.log("Starting initializeQA");
        try {
          console.log("Ensuring session...");
          await ensureSession(false, contextMessage);

          setIsLoading(true);
          console.log("Requesting first question...");

          const firstQuestion = await sendMessage(
            "Start by asking your first question about the video content."
          );
          console.log("Received first question:", firstQuestion);

          setMessages((prev) => [
            INITIAL_MESSAGE,
            {
              id: prev.length + 1,
              content: firstQuestion,
              sender: "ai",
            },
          ]);
        } catch (error) {
          console.error("Error in initializeQA:", error);
        } finally {
          setIsLoading(false);
        }
      };

      initializeQA();
    } else {
      console.log("Waiting for transcript...", {
        isTranscriptLoading,
        transcriptLength: transcript?.length,
        hasTranscript: !!transcript,
      });
    }
  }, [transcript, isTranscriptLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setIsLoading(true);
    setInput("");

    try {
      console.log("Sending user answer:", userMessage);
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, content: userMessage, sender: "user" },
      ]);

      const response = await sendMessage(
        `${userMessage}\n\nPlease provide feedback on my answer and ask the next question.`
      );
      console.log("Received AI response:", response);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: response,
          sender: "ai",
        },
      ]);
    } catch (error) {
      console.error("Error in handleSend:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: "Sorry, I encountered an error. Please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useUrlChange(() => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  });

  return (
    <div className="flex flex-col h-full text-white">
      <div className="flex-shrink-0 p-4">
        <Header />
      </div>
      <div className="flex-grow min-h-0 overflow-hidden">
        <ScrollContent>
          <div className="px-4 pb-4">
            <MessageList messages={messages} isLoading={isLoading} />
          </div>
        </ScrollContent>
      </div>
      <div className="flex-shrink-0 p-4 sticky bottom-0 bg-[#0F0F0F] border-t border-gray-800">
        <MessageInput
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}
