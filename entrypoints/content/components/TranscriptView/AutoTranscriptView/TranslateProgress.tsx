interface TranslateProgressProps {
  isTranslating: boolean;
  isTranscriptLoading: boolean;
}

export function TranslateProgress({
  isTranslating,
  isTranscriptLoading,
}: TranslateProgressProps) {
  if (!isTranslating && !isTranscriptLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
      <span className="text-gray-600">
        {isTranscriptLoading
          ? "Loading transcript..."
          : "Translating transcript..."}
      </span>
    </div>
  );
}
