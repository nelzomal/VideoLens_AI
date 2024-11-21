import { SummarizeButton } from "./SummarizeButton";
import { RetryButton } from "./RetryButton";
import { LoadingProgress } from "./LoadingProgress";

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
}: ControlPanelProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      {showSummarizeButton && (
        <SummarizeButton
          isLoading={isLoading}
          hasSummaries={hasSummaries}
          onClick={onSummarize}
          disabled={isLoading || sectionsLength === 0}
        />
      )}

      {isLoading && currentSection !== null && (
        <div className="text-gray-400">
          Summarizing Section {currentSection + 1}...
        </div>
      )}

      {failedSections.length > 0 && (
        <RetryButton
          failedCount={failedSections.length}
          onClick={onRetry}
          disabled={isLoading}
        />
      )}
    </div>

    {isLoading && progress.total > 0 && <LoadingProgress progress={progress} />}
  </div>
);
