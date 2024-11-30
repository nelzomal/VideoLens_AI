interface TranslateProgressProps {
  isTranslating: boolean;
  isTranscriptLoading: boolean;
  translateWarning: React.ReactNode;
}

export function TranslateProgress({
  isTranslating,
  isTranscriptLoading,
  translateWarning,
}: TranslateProgressProps) {
  if (!isTranslating && !isTranscriptLoading && !translateWarning) return null;

  return (
    <div className="space-y-2">
      {translateWarning}
      {(isTranslating || isTranscriptLoading) && (
        <div className="text-muted-foreground text-base">
          {isTranscriptLoading ? "Loading transcript..." : "Translating..."}
        </div>
      )}
    </div>
  );
}
