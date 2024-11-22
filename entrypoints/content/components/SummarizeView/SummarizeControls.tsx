import { Button } from "@/components/ui/button";
import { SectionSummary } from "./hooks/useSummarize";

interface SummarizeControlsProps {
  sections: Array<Array<{ start: number; text: string }>>;
  sectionSummaries: SectionSummary[];
  isLoading: boolean;
  handleSummarizeAll: () => void;
}

export function SummarizeControls({
  sections,
  sectionSummaries,
  isLoading,
  handleSummarizeAll,
}: SummarizeControlsProps) {
  return (
    <>
      {sections.some((_, index) => !sectionSummaries[index]) && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSummarizeAll}
          disabled={isLoading || sections.length === 0}
        >
          {Object.keys(sectionSummaries).length > 0
            ? "Continue Summarizing"
            : "Summarize Transcript"}
        </Button>
      )}
    </>
  );
}
