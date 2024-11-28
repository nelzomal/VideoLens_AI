import { MAX_SUMMARY_INPUT_TOKENS } from "@/lib/constants";

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function groupTranscriptIntoSections(
  transcript: Array<{ start: number; text: string }>
) {
  if (!transcript || transcript.length === 0) {
    return [];
  }
  console.log(
    "[groupTranscriptIntoSections] Grouping transcript into sections",
    {
      transcriptLength: transcript.length,
      transcript,
    }
  );

  if (transcript.length < 2) {
    return [transcript];
  }

  // Helper function to count tokens in a section
  const getTokenCount = (section: Array<{ text: string }>) => {
    return section.reduce((count, entry) => count + entry.text.length / 4, 0);
  };

  // Calculate total character count
  const totalCharCount = transcript.reduce(
    (sum, entry) => sum + entry.text.length,
    0
  );
  // Target around 20% of total characters per section
  const targetCharCount = Math.ceil(totalCharCount / 5);

  const sections: Array<Array<{ start: number; text: string }>> = [];
  let currentSection: Array<{ start: number; text: string }> = [];
  let currentCharCount = 0;

  for (const entry of transcript) {
    const potentialSection = [...currentSection, entry];
    const potentialCharCount = currentCharCount + entry.text.length;

    if (
      potentialCharCount >= targetCharCount &&
      sections.length < 4 &&
      getTokenCount(potentialSection) <= MAX_SUMMARY_INPUT_TOKENS
    ) {
      if (currentSection.length > 0) {
        sections.push(currentSection);
      }
      currentSection = [];
      currentCharCount = 0;
    }

    if (getTokenCount(potentialSection) <= MAX_SUMMARY_INPUT_TOKENS) {
      currentSection.push(entry);
      currentCharCount += entry.text.length;
    } else {
      if (currentSection.length > 0) {
        sections.push(currentSection);
      }
      currentSection = [entry];
      currentCharCount = entry.text.length;
    }
  }

  if (currentSection.length > 0) {
    sections.push(currentSection);
  }
  console.log("[groupTranscriptIntoSections] Sections", sections);
  return sections;
}
