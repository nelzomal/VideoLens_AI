import { SummarizeButton } from "./SummarizeButton";
import { RetryButton } from "./RetryButton";

interface ControlPanelProps {
  showSummarizeButton: boolean;
  isLoading: boolean;
  hasSummaries: boolean;
  onSummarize: () => void;
  currentSection: number | null;
  failedSections: number[];
  onRetry: () => void;
  sectionsLength: number;
  progress: { loaded: number; total: number };
}

export const ControlPanel = ({
  showSummarizeButton,
  isLoading,
  hasSummaries,
  onSummarize,
  currentSection,
  failedSections,
  onRetry,
  sectionsLength,
  progress,
}: ControlPanelProps) => {
  return (
    <div className="space-y-2">
      {!isLoading && (
        <div className="flex gap-2 items-center">
          {showSummarizeButton && (
            <SummarizeButton
              isLoading={isLoading}
              hasSummaries={hasSummaries}
              onClick={onSummarize}
              disabled={isLoading || sectionsLength === 0}
            />
          )}

          {failedSections.length > 0 && (
            <RetryButton
              failedCount={failedSections.length}
              onClick={onRetry}
              disabled={isLoading}
            />
          )}
        </div>
      )}

      {isLoading && (
        <div className="p-3 text-blue-400">
          {currentSection !== null
            ? `Summarizing Section ${
                currentSection + 1
              } of ${sectionsLength}...`
            : progress.total > 0
            ? `Loading model: ${Math.round(
                (progress.loaded / progress.total) * 100
              )}%`
            : "Processing..."}
        </div>
      )}
    </div>
  );
};
