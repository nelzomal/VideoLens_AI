import { useState } from "react";
import { usePersistedTranscript } from "../../hooks/usePersistedTranscript";
import { useSummarize } from "./hooks/useSummarize";
import { useUrlChange } from "../../hooks/useUrlChange";
import { TabTemplate } from "../TabTemplate";
import { SummaryContent } from "./SummaryContent";
import { groupTranscriptIntoSections } from "./utils";
import { SummarizeControls } from "./SummarizeControls";
import { SummarizeProgress } from "./SummarizeProgress";

export function SummarizeView() {
  const { transcript } = usePersistedTranscript();
  const {
    summarizeSections,
    sectionSummaries,
    isSummarizing,
    currentSection,
    isSummarizeDone,
  } = useSummarize({ transcript });

  // Group sections here since we need them for the UI
  const sections = transcript ? groupTranscriptIntoSections(transcript) : [];

  const handleTimeClick = (timestamp: number) => {
    const videoElement = document.querySelector("video");
    if (videoElement) {
      videoElement.currentTime = timestamp;
    }
  };

  // No need for the URL change handler since sectionSummaries are managed by the hook now

  return (
    <TabTemplate
      controls={
        !isSummarizeDone && (
          <SummarizeControls
            sections={sections}
            sectionSummaries={sectionSummaries}
            isLoading={isSummarizing}
            handleSummarizeAll={summarizeSections}
          />
        )
      }
      progressSection={
        isSummarizing && <SummarizeProgress currentSection={currentSection} />
      }
      mainContent={
        <SummaryContent
          sections={sections}
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
