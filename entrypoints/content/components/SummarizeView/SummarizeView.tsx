import { useEffect, useState } from "react";
import { useSummarize } from "./hooks/useSummarize";
import { TabTemplate } from "../TabTemplate";
import { SummaryContent } from "./SummaryContent";
import { SummarizeControls } from "./SummarizeControls";
import { SummarizeProgress } from "./SummarizeProgress";
import { checkSummarizeCapability } from "@/lib/ai";
import { AIFeatureWarning } from "../shared/AIFeatureWarning";

export function SummarizeView() {
  const [canSummarize, setCanSummarize] = useState<boolean | null>(null);
  const {
    summarizeSections,
    sectionSummaries,
    isSummarizing,
    currentSection,
    isSummarizeDone,
  } = useSummarize();

  useEffect(() => {
    const checkCapability = async () => {
      const result = await checkSummarizeCapability();
      setCanSummarize(result);
    };
    checkCapability();
  }, []);

  const handleTimeClick = (timestamp: number) => {
    const videoElement = document.querySelector("video");
    if (videoElement) {
      videoElement.currentTime = timestamp;
    }
  };

  return canSummarize ? (
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
  ) : (
    <AIFeatureWarning
      isLoading={canSummarize === null}
      isFeatureEnabled={canSummarize ?? false}
      feature="AI Summarize"
    />
  );
}
