import { usePersistedTranscript } from "../../hooks/usePersistedTranscript";
import { useSummarize } from "../../hooks/useSummarize";
import { useSectionSummaries } from "../../hooks/useSectionSummaries";
import { groupTranscriptIntoSections } from "../../lib/transcriptUtils";
import { Header } from "./Header";
import { ControlPanel } from "./ControlPanel";
import { SummaryContent } from "./SummaryContent";
import { TranscriptEntry } from "../../types/transcript";

export function SummarizeView() {
  const { transcript } = usePersistedTranscript();
  const { isLoading, progress } = useSummarize();
  const sections = transcript
    ? groupTranscriptIntoSections(transcript, 300)
    : [];

  const {
    sectionSummaries,
    currentSection,
    failedSections,
    isCheckingCache,
    isInitialLoad,
    handleSummarizeAll,
    handleRetrySections,
  } = useSectionSummaries(sections);

  const handleTimeClick = (timestamp: number) => {
    const videoElement = document.querySelector("video");
    if (videoElement) {
      videoElement.currentTime = timestamp;
    }
  };

  if (sections.length === 0) {
    return (
      <div className="space-y-4 p-4 text-white">
        <Header />
        <div className="text-gray-400">Loading transcript...</div>
      </div>
    );
  }

  const showSummarizeButton =
    !isCheckingCache &&
    !isInitialLoad &&
    sections.some(
      (_: TranscriptEntry[], index: number) => !sectionSummaries[index]
    );

  return (
    <div className="space-y-4 p-4 text-white">
      <Header />
      <div className="space-y-4">
        <ControlPanel
          showSummarizeButton={showSummarizeButton}
          isLoading={isLoading}
          hasSummaries={Object.keys(sectionSummaries).length > 0}
          onSummarize={handleSummarizeAll}
          currentSection={currentSection}
          failedSections={failedSections}
          onRetry={handleRetrySections}
          sectionsLength={sections.length}
          progress={progress}
        />
        <SummaryContent
          sections={sections}
          sectionSummaries={sectionSummaries}
          onTimeClick={handleTimeClick}
        />
      </div>
    </div>
  );
}
