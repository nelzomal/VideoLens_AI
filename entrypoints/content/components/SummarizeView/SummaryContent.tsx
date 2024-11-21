import { TranscriptEntry } from "../../types/transcript";
import { SummarySection } from "./SummarySection";
import { ScrollContent } from "../common/ScrollContent";

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
  <ScrollContent className="space-y-0.5">
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
  </ScrollContent>
);
