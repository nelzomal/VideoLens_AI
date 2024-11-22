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

  if (transcript.length < 2) {
    return [transcript];
  }

  const totalDuration =
    transcript[transcript.length - 1].start - transcript[0].start;

  if (!totalDuration || totalDuration <= 0) {
    const entriesPerSection = Math.ceil(transcript.length / 5);
    const sections: Array<Array<{ start: number; text: string }>> = [];

    for (let i = 0; i < transcript.length; i += entriesPerSection) {
      sections.push(transcript.slice(i, i + entriesPerSection));
    }

    return sections;
  }

  const targetSectionLength = Math.ceil(totalDuration / 5);
  const sections: Array<Array<{ start: number; text: string }>> = [];
  let currentSection: Array<{ start: number; text: string }> = [];
  let sectionStartTime = transcript[0].start;

  transcript.forEach((entry) => {
    if (
      entry.start - sectionStartTime >= targetSectionLength &&
      sections.length < 4
    ) {
      if (currentSection.length > 0) {
        sections.push(currentSection);
      }
      currentSection = [];
      sectionStartTime = entry.start;
    }
    currentSection.push(entry);
  });

  if (currentSection.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}
