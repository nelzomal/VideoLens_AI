import { useEffect, useState } from "react";
import { TabTemplate } from "../TabTemplate";
import { QAContent } from "./QAContent";
import { AICapabilityCheckResult, checkAICapabilities } from "@/lib/ai";
import { AIFeatureWarning } from "../shared/AIFeatureWarning";

interface QAViewProps {
  isActive: boolean;
}

export const QAView: React.FC<QAViewProps> = ({ isActive }) => {
  const [capabilities, setCapabilities] =
    useState<AICapabilityCheckResult | null>(null);

  useEffect(() => {
    const checkCapabilities = async () => {
      const result = await checkAICapabilities();
      setCapabilities(result);
    };
    checkCapabilities();
  }, []);

  return capabilities?.canPrompt ? (
    <TabTemplate
      mainContent={<QAContent isActive={isActive} />}
      className="text-foreground bg-background"
    />
  ) : (
    <AIFeatureWarning
      isLoading={capabilities === null}
      isFeatureEnabled={capabilities?.canPrompt ?? false}
      feature="AI Chat"
    />
  );
};
