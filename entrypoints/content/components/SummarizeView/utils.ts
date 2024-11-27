import { MAX_SUMMARY_INPUT_TOKENS } from "@/lib/constants";

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function groupTranscriptIntoSections(
  transcript: Array<{ start: number; text: string }>
) {
  console.log(
    "[groupTranscriptIntoSections] Grouping transcript into sections",
    {
      transcriptLength: transcript.length,
      transcript,
    }
  );

  if (!transcript || transcript.length === 0) {
    return [];
  }

  if (transcript.length < 2) {
    return [transcript];
  }

  // Helper function to count tokens in a section
  const getTokenCount = (section: Array<{ text: string }>) => {
    return section.reduce((count, entry) => count + entry.text.length / 4, 0);
  };

  const totalDuration =
    transcript[transcript.length - 1].start - transcript[0].start;

  if (!totalDuration || totalDuration <= 0) {
    // Handle case with no duration by splitting by entry count
    const sections: Array<Array<{ start: number; text: string }>> = [];
    let currentSection: Array<{ start: number; text: string }> = [];

    for (const entry of transcript) {
      if (
        getTokenCount([...currentSection, entry]) > MAX_SUMMARY_INPUT_TOKENS
      ) {
        if (currentSection.length > 0) {
          sections.push(currentSection);
        }
        currentSection = [entry];
      } else {
        currentSection.push(entry);
      }
    }

    if (currentSection.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }

  // Try to split into 5 sections if possible
  const targetSectionLength = Math.ceil(totalDuration / 5);
  const sections: Array<Array<{ start: number; text: string }>> = [];
  let currentSection: Array<{ start: number; text: string }> = [];
  let sectionStartTime = transcript[0].start;

  for (const entry of transcript) {
    const potentialSection = [...currentSection, entry];

    if (
      entry.start - sectionStartTime >= targetSectionLength &&
      sections.length < 4 &&
      getTokenCount(potentialSection) <= MAX_SUMMARY_INPUT_TOKENS
    ) {
      if (currentSection.length > 0) {
        sections.push(currentSection);
      }
      currentSection = [];
      sectionStartTime = entry.start;
    }

    if (getTokenCount(potentialSection) <= MAX_SUMMARY_INPUT_TOKENS) {
      currentSection.push(entry);
    } else {
      if (currentSection.length > 0) {
        sections.push(currentSection);
      }
      currentSection = [entry];
      sectionStartTime = entry.start;
    }
  }

  if (currentSection.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}
