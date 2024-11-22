import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QAControlsProps {
  input: string;
  isLoading: boolean;
  setInput: (value: string) => void;
  handleSend: () => void;
}

export function QAControls({
  input,
  isLoading,
  setInput,
  handleSend,
}: QAControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Ask a question about the video..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
        className="flex-grow"
        disabled={isLoading}
      />
      <Button
        onClick={handleSend}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Ask
      </Button>
    </div>
  );
}
