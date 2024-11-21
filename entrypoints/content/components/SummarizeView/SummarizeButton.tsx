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
}: SummarizeButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || isLoading) return;
    onClick();
  };

  return (
    <button
      className={`px-4 py-2 rounded ${
        disabled || isLoading
          ? "bg-gray-600 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {hasSummaries ? "Continue Summarizing" : "Summarize Transcript"}
    </button>
  );
};
