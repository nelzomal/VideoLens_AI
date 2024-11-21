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
    <div className="mt-4">
      <h3 className="text-md font-medium flex items-center gap-2">
        <span
          className="text-blue-400 cursor-pointer hover:text-blue-300"
          onClick={() => onTimeClick(startTime)}
        >
          {formatTime(startTime)}
        </span>
        <span className="text-gray-400">-</span>
        <span
          className="text-blue-400 cursor-pointer hover:text-blue-300"
          onClick={() => onTimeClick(endTime)}
        >
          {formatTime(endTime)}
        </span>
      </h3>
      <div className="bg-gray-800 p-2 rounded mt-2 whitespace-pre-wrap">
        {summary.split("* ").map((point, i) => {
          if (!point.trim()) return null;
          return (
            <div key={i} className="mb-2">
              <span className="text-gray-400">•</span>{" "}
              {point.replace(/\*\*/g, "").trim()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
