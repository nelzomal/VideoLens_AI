interface SummarizeButtonProps {
  isLoading: boolean;
  hasSummaries: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const SummarizeButton = ({
  isLoading,
  hasSummaries,
  onClick,
  disabled,
}: SummarizeButtonProps) => (
  <button
    className={`px-4 py-2 rounded ${
      disabled
        ? "bg-gray-600 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
    onClick={onClick}
    disabled={disabled}
  >
    {hasSummaries ? "Continue Summarizing" : "Summarize Transcript"}
  </button>
);
