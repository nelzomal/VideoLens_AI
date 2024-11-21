import { usePersistedTranscript } from "../../hooks/usePersistedTranscript";
import { useSummarize } from "../../hooks/useSummarize";
import { useSectionSummaries } from "../../hooks/useSectionSummaries";
import { groupTranscriptIntoSections } from "../../lib/transcriptUtils";
import { Header } from "./Header";
import { ControlPanel } from "./ControlPanel";
import { SummaryContent } from "./SummaryContent";
import { TranscriptEntry } from "../../types/transcript";
import { ScrollContent } from "../common/ScrollContent";

export function SummarizeView() {
  const { transcript } = usePersistedTranscript();
  const { isLoading, progress, handleSummarize } = useSummarize();

  const sections = transcript
    ? groupTranscriptIntoSections(transcript, 300)
    : [];

  const {
    sectionSummaries,
    currentSection,
    failedSections,
    isCheckingCache,
    isInitialLoad,
    isSummarizing,
    handleSummarizeAll,
    handleRetrySections,
  } = useSectionSummaries(sections);

  const handleSummarizeClick = () => {
    handleSummarizeAll();
  };

  const handleTimeClick = (timestamp: number) => {
    const videoElement = document.querySelector("video");
    if (videoElement) {
      videoElement.currentTime = timestamp;
    }
  };

  if (sections.length === 0) {
    return (
      <div className="flex flex-col h-full text-white">
        <div className="flex-shrink-0 p-4">
          <Header />
        </div>
        <div className="flex-shrink-0 px-4">
          <div className="text-gray-400">Loading transcript...</div>
        </div>
      </div>
    );
  }

  const showSummarizeButton =
    !isCheckingCache &&
    !isInitialLoad &&
    !isLoading &&
    !isSummarizing &&
    sections.some(
      (section: TranscriptEntry[], index: number) => !sectionSummaries[index]
    );

  return (
    <div className="flex flex-col h-full text-white">
      <div className="flex-shrink-0 p-4">
        <Header />
      </div>
      <div className="flex-shrink-0 px-4">
        <ControlPanel
          showSummarizeButton={showSummarizeButton}
          isLoading={isLoading || isSummarizing}
          hasSummaries={Object.keys(sectionSummaries).length > 0}
          onSummarize={handleSummarizeClick}
          currentSection={currentSection}
          failedSections={failedSections}
          onRetry={handleRetrySections}
          sectionsLength={sections.length}
          progress={progress}
        />
      </div>
      <div className="flex-grow min-h-0">
        <ScrollContent>
          <div className="px-4">
            <SummaryContent
              sections={sections}
              sectionSummaries={sectionSummaries}
              onTimeClick={handleTimeClick}
            />
          </div>
        </ScrollContent>
      </div>
    </div>
  );
}
