interface SummarizeProgressProps {
  currentSection: number | null;
  totalSections: number;
}

export function SummarizeProgress({
  currentSection,
  totalSections,
}: SummarizeProgressProps) {
  if (currentSection === null) {
    return null;
  }

  return (
    <div className="text-muted-foreground text-base">
      Summarizing Section {currentSection + 1} of {totalSections}...
    </div>
  );
}
