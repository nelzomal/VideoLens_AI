import { useState } from "react";
import { usePersistedTranscript } from "../../hooks/usePersistedTranscript";
import { useSummarize } from "./hooks/useSummarize";
import { useUrlChange } from "../../hooks/useUrlChange";
import { TabTemplate } from "../TabTemplate";
import { SummaryContent } from "./SummaryContent";
import { SummarizeControls } from "./SummarizeControls";
import { SummarizeProgress } from "./SummarizeProgress";

export function SummarizeView() {
  const {
    summarizeSections,
    sectionSummaries,
    isSummarizing,
    currentSection,
    isSummarizeDone,
  } = useSummarize();

  const handleTimeClick = (timestamp: number) => {
    const videoElement = document.querySelector("video");
    if (videoElement) {
      videoElement.currentTime = timestamp;
    }
  };

  console.log("isSummarizeDone", isSummarizeDone);

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
