import { formatTime } from "../../lib/transcriptUtils";

interface SummarySectionProps {
  startTime: number;
  endTime: number;
  summary: string;
  onTimeClick: (timestamp: number) => void;
}

export function SummarySection({
  startTime,
  endTime,
  summary,
  onTimeClick,
}: SummarySectionProps) {
  return (
    <div className="flex flex-col p-3 hover:bg-gray-800 transition-colors duration-150">
      <div className="flex gap-6">
        <span
          className="text-[#3ea6ff] font-medium min-w-[52px] cursor-pointer"
          onClick={() => onTimeClick(startTime)}
        >
          {formatTime(startTime)}
        </span>
        <div className="text-gray-100">
          {summary.split("* ").map((point, i) => {
            if (!point.trim()) return null;
            return (
              <div key={i} className="mb-2">
                <span className="text-gray-400 mr-2">•</span>
                {point.replace(/\*\*/g, "").trim()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
