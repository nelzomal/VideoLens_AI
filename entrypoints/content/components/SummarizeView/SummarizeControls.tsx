import { Button } from "@/components/ui/button";
import { SectionSummary } from "./hooks/useSummarize";

interface SummarizeControlsProps {
  sectionSummaries: SectionSummary[];
  isLoading: boolean;
  handleSummarizeAll: () => void;
}

export function SummarizeControls({
  sectionSummaries,
  isLoading,
  handleSummarizeAll,
}: SummarizeControlsProps) {
  console.log("SummarizeControls sectionSummaries", sectionSummaries);
  return (
    sectionSummaries.some((_, index) => !sectionSummaries[index].summary) && (
      <Button
        variant="mui-contained"
        size="lg"
        onClick={handleSummarizeAll}
        className="shadow-sm text-base font-medium h-11 px-8"
        disabled={isLoading || sectionSummaries.length === 0}
      >
        Summarize Content
      </Button>
    )
  );
}
