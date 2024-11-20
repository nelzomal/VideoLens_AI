import { useState } from "react";
import { summarizeText } from "@/entrypoints/content/lib/summarize";

export function useSummarize() {
  const [text, setText] = useState(
    "This is a sample text that we want to summarize. It contains multiple sentences about various topics. The weather is nice today. AI technology is advancing rapidly. People are learning to adapt to new technologies."
  );
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const result = await summarizeText(text, undefined, (loaded, total) =>
        setProgress({ loaded, total })
      );
      setSummary(result);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    text,
    setText,
    summary,
    isLoading,
    progress,
    handleSummarize,
  };
}
