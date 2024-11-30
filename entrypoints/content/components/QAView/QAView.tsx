import { useEffect, useState } from "react";
import { TabTemplate } from "../TabTemplate";
import { QAContent } from "./QAContent";
import { AIFeatureWarning } from "../shared/AIFeatureWarning";
import { checkPromptCapability } from "@/lib/ai";

interface QAViewProps {
  isActive: boolean;
}

export const QAView: React.FC<QAViewProps> = ({ isActive }) => {
  const [canPrompt, setCanPrompt] = useState<boolean | null>(null);

  useEffect(() => {
    const checkCapability = async () => {
      const result = await checkPromptCapability();
      setCanPrompt(result);
    };
    checkCapability();
  }, []);

  return canPrompt ? (
    <TabTemplate
      mainContent={<QAContent isActive={isActive} />}
      className="text-foreground bg-background"
    />
  ) : (
    <AIFeatureWarning
      isLoading={canPrompt === null}
      isFeatureEnabled={canPrompt ?? false}
      feature="AI Chat"
    />
  );
};
