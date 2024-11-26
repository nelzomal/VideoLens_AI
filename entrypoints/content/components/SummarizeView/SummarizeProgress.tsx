interface SummarizeProgressProps {
  currentSection: number | null;
}

export function SummarizeProgress({ currentSection }: SummarizeProgressProps) {
  if (currentSection === null) {
    return null;
  }

  return (
    <div className="text-muted-foreground text-sm">
      Summarizing Section {currentSection + 1}...
    </div>
  );
}
