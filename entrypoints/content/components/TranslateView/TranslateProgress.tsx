interface TranslateProgressProps {
  isTranslating: boolean;
}

export function TranslateProgress({ isTranslating }: TranslateProgressProps) {
  if (!isTranslating) {
    return null;
  }

  return <div className="text-gray-400">Translating transcript...</div>;
}
