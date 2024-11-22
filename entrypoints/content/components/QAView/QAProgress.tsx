import { Loader2 } from "lucide-react";

interface QAProgressProps {
  isLoading: boolean;
}

export function QAProgress({ isLoading }: QAProgressProps) {
  if (!isLoading) return null;

  return (
    <div className="flex items-center space-x-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>AI is thinking...</span>
    </div>
  );
}
