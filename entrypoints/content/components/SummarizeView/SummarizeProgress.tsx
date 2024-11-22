import { Progress } from "@/components/ui/progress";

interface SummarizeProgressProps {
  currentSection: number | null;
}

export function SummarizeProgress({ currentSection }: SummarizeProgressProps) {
  if (currentSection === null) {
    return null;
  }

  return (
    <div className="text-gray-400">
      Summarizing Section {currentSection + 1}...
    </div>
  );
}
