interface RetryButtonProps {
  failedCount: number;
  onClick: () => void;
  disabled: boolean;
}

export const RetryButton = ({
  failedCount,
  onClick,
  disabled,
}: RetryButtonProps) => (
  <button
    className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
    onClick={onClick}
    disabled={disabled}
  >
    Retry Failed Sections ({failedCount})
  </button>
);
