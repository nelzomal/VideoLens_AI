import { Button } from "@/components/ui/button";

interface TranslateControlsProps {
  transcript: Array<{ start: number; text: string }>;
  isTranscriptLoading: boolean;
  loadTranscript: () => void;
}

export function TranslateControls({
  transcript,
  isTranscriptLoading,
  loadTranscript,
}: TranslateControlsProps) {
  return (
    <>
      {transcript.length === 0 && !isTranscriptLoading && (
        <Button
          variant="mui-outlined"
          size="sm"
          onClick={loadTranscript}
          disabled={isTranscriptLoading}
          className="shadow-sm"
        >
          Load Transcript
        </Button>
      )}
    </>
  );
}
