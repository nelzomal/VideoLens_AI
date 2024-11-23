import { SectionSummary } from "./hooks/useSummarize";
import { formatTime } from "./utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SummaryContentProps {
  sections: Array<Array<{ start: number; text: string }>>;
  sectionSummaries: SectionSummary[];
  isLoading: boolean;
  currentSection: number | null;
  handleTimeClick: (timestamp: number) => void;
}

export function SummaryContent({
  sections,
  sectionSummaries,
  isLoading,
  currentSection,
  handleTimeClick,
}: SummaryContentProps) {
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {sections.length === 0 &&
            Object.keys(sectionSummaries).length === 0 && (
              <div className="text-gray-400">Loading transcript...</div>
            )}

          <div className="space-y-4">
            {sections.map((section, index) => {
              const summary = sectionSummaries[index];
              if (!summary) return null;

              const startTime = section[0].start;
              const endTime = section[section.length - 1].start;

              return (
                <div key={index} className="mt-4">
                  <h3 className="text-md font-medium flex items-center gap-2">
                    <span
                      className="text-blue-400 cursor-pointer hover:text-blue-300"
                      onClick={() => handleTimeClick(startTime)}
                    >
                      {formatTime(startTime)}
                    </span>
                    <span className="text-gray-400">-</span>
                    <span
                      className="text-blue-400 cursor-pointer hover:text-blue-300"
                      onClick={() => handleTimeClick(endTime)}
                    >
                      {formatTime(endTime)}
                    </span>
                  </h3>
                  <div className="bg-gray-800 p-2 rounded mt-2 whitespace-pre-wrap">
                    {summary.summary
                      .split("* ")
                      .map((point: string, i: number) => {
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
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
