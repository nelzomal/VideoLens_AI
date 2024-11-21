import { TranscriptEntry } from "../../types/transcript";
import { SummarySection } from "./SummarySection";

interface SummaryContentProps {
  sections: TranscriptEntry[][];
  sectionSummaries: Record<number, string>;
  onTimeClick: (timestamp: number) => void;
}

export const SummaryContent = ({
  sections,
  sectionSummaries,
  onTimeClick,
}: SummaryContentProps) => (
  <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
    {sections.map((section: TranscriptEntry[], index: number) => {
      const summary = sectionSummaries[index];
      if (!summary) return null;

      return (
        <SummarySection
          key={index}
          startTime={section[0].start}
          endTime={section[section.length - 1].start}
          summary={summary}
          onTimeClick={onTimeClick}
        />
      );
    })}
  </div>
);
