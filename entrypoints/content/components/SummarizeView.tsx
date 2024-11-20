import { useSummarize } from "../hooks/useSummarize";

export function SummarizeView() {
  const { text, setText, summary, isLoading, progress, handleSummarize } =
    useSummarize();

  return (
    <div className="space-y-4 p-4 text-white">
      <h2 className="text-lg font-medium">Test Summarization</h2>
      <div className="space-y-4">
        <textarea
          className="w-full h-32 p-2 bg-gray-800 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to summarize..."
        />
        <button
          className="px-4 py-2 bg-blue-600 rounded"
          onClick={handleSummarize}
          disabled={isLoading}
        >
          {isLoading ? "Summarizing..." : "Summarize"}
        </button>
        {isLoading && progress.total > 0 && (
          <div>
            Loading model:{" "}
            {Math.round((progress.loaded / progress.total) * 100)}%
          </div>
        )}
        {summary && (
          <div className="mt-4">
            <h3 className="text-md font-medium">Summary:</h3>
            <p className="bg-gray-800 p-2 rounded mt-2">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
