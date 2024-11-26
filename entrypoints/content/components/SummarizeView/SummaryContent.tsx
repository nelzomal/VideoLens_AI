import { SectionSummary } from "./hooks/useSummarize";
import { formatTime } from "./utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

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
        <div className="space-y-6 p-6">
          {sections.length === 0 &&
            Object.keys(sectionSummaries).length === 0 && (
              <div className="text-muted-foreground text-base">
                Loading transcript...
              </div>
            )}

          <div className="space-y-6">
            {sections.map((section, index) => {
              const summary = sectionSummaries[index];
              if (!summary) return null;

              const startTime = section[0].start;
              const endTime = section[section.length - 1].start;

              return (
                <div key={index} className="rounded-lg border bg-card p-4">
                  <h3 className="text-base font-medium flex items-center gap-2 mb-3">
                    <span
                      className="text-primary hover:text-primary/80 cursor-pointer transition-colors"
                      onClick={() => handleTimeClick(startTime)}
                    >
                      {formatTime(startTime)}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span
                      className="text-primary hover:text-primary/80 cursor-pointer transition-colors"
                      onClick={() => handleTimeClick(endTime)}
                    >
                      {formatTime(endTime)}
                    </span>
                  </h3>

                  {isLoading && currentSection === index ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-base">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Summarizing section...</span>
                    </div>
                  ) : summary ? (
                    <div className="space-y-2">
                      {summary.summary
                        .split("* ")
                        .map((point: string, i: number) => {
                          if (!point.trim()) return null;
                          return (
                            <div key={i} className="flex gap-2 text-base">
                              <span className="text-muted-foreground">•</span>
                              <span>{point.replace(/\*\*/g, "").trim()}</span>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-base">
                      Waiting to be summarized...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
