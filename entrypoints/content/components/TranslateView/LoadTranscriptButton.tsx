interface LoadTranscriptButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export const LoadTranscriptButton = ({
  isLoading,
  onClick,
}: LoadTranscriptButtonProps) => (
  <button
    className="px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
    onClick={onClick}
    disabled={isLoading}
  >
    {isLoading ? "Loading..." : "Load Transcript"}
  </button>
);
