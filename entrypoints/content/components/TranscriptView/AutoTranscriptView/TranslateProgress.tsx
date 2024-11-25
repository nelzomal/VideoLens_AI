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
    <div className="text-gray-400">
      {isTranscriptLoading
        ? "Loading transcript..."
        : "Translating transcript..."}
    </div>
  );
}
