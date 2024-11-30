import { useEffect, useState } from "react";
import { useSummarize } from "./hooks/useSummarize";
import { TabTemplate } from "../TabTemplate";
import { SummaryContent } from "./SummaryContent";
import { SummarizeControls } from "./SummarizeControls";
import { SummarizeProgress } from "./SummarizeProgress";
import { AICapabilityCheckResult, checkAICapabilities } from "@/lib/ai";
import { AIFeatureWarning } from "../shared/AIFeatureWarning";

export function SummarizeView() {
  const [capabilities, setCapabilities] =
    useState<AICapabilityCheckResult | null>(null);
  const {
    summarizeSections,
    sectionSummaries,
    isSummarizing,
    currentSection,
    isSummarizeDone,
  } = useSummarize();

  useEffect(() => {
    const checkCapabilities = async () => {
      const result = await checkAICapabilities();
      setCapabilities(result);
    };
    checkCapabilities();
  }, []);

  const warning = (
    <AIFeatureWarning
      isLoading={capabilities === null}
      isFeatureEnabled={capabilities?.canSummarize ?? false}
      feature="AI Summarize"
    />
  );

  if (warning) return warning;

  return (
    <TabTemplate
      controls={
        !isSummarizeDone && (
          <SummarizeControls
            sectionSummaries={sectionSummaries}
            isLoading={isSummarizing}
            handleSummarizeAll={summarizeSections}
          />
        )
      }
      progressSection={
        isSummarizing && (
          <SummarizeProgress
            currentSection={currentSection}
            totalSections={sectionSummaries.length}
          />
        )
      }
      mainContent={
        <SummaryContent
          sectionSummaries={sectionSummaries}
          isLoading={isSummarizing}
          currentSection={currentSection}
          handleTimeClick={handleTimeClick}
        />
      }
      className="text-foreground bg-background"
    />
  );
}
