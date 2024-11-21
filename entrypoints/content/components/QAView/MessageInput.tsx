import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export const MessageInput = ({
  input,
  isLoading,
  onInputChange,
  onSend,
}: MessageInputProps) => (
  <div className="flex items-center gap-2">
    <Input
      type="text"
      placeholder="Ask a question about the video..."
      value={input}
      onChange={(e) => onInputChange(e.target.value)}
      onKeyPress={(e) => e.key === "Enter" && onSend()}
      className="flex-grow"
      disabled={isLoading}
    />
    <Button
      onClick={onSend}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700"
    >
      Ask
    </Button>
  </div>
);
