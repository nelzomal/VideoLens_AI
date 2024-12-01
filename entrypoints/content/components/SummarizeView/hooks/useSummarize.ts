import { useState, useEffect } from "react";
import { summarizeText } from "@/lib/summarize";
import { groupTranscriptIntoSections } from "../utils";
import { withRetry } from "@/lib/utils";
import { usePersistedTranscript } from "@/entrypoints/content/hooks/usePersistedTranscript";
import { getStoredSummaries, storeSummaries } from "@/lib/storage";
import { useVideoId } from "@/entrypoints/content/hooks/useVideoId";

export interface SectionSummary {
  startTime: number;
  endTime: number;
  text: string;
  summary?: string;
}

async function summarizeWithRetry(text: string): Promise<string | null> {
  return await withRetry(() => summarizeText(text));
}

/**
 * A React hook that manages the state and logic for summarizing video transcript sections.
 *
 * This hook handles:
 * - Breaking down a transcript into manageable sections
 * - Generating AI summaries for each section
 * - Tracking progress of the summarization process
 * - Managing loading and completion states
 *
 * The summarization happens sequentially, one section at a time, with retry logic
 * built in to handle potential API failures.
 *
 * @param props.transcript - Array of transcript entries containing text and timestamps
 * @returns {Object} An object containing:
 *   - summarizeSections: Function to start the summarization process
 *   - sectionSummaries: Array of generated summaries with their timestamps
 *   - isSummarizing: Boolean indicating if summarization is in progress
 *   - isSummarizeDone: Boolean indicating if summarization is complete
 *   - currentSection: Number indicating which section is currently being processed
 */
export function useSummarize() {
  const { transcript } = usePersistedTranscript();
  const videoId = useVideoId();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSummarizeDone, setIsSummarizeDone] = useState(false);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [sectionSummaries, setSectionSummaries] = useState<SectionSummary[]>(
    []
  );

  useEffect(() => {
    if (!videoId || !transcript) return;

    const storedSummaries = getStoredSummaries(videoId);
    if (storedSummaries) {
      setSectionSummaries(storedSummaries);
      const allSummarized = storedSummaries.every(
        (section) => !!section.summary
      );
      setIsSummarizeDone(allSummarized);
      return;
    }

    const groupedSections = groupTranscriptIntoSections(transcript);
    setSectionSummaries(
      groupedSections.map((section) => ({
        startTime: section[0].start,
        endTime: section[section.length - 1].start,
        text: section.map((entry) => entry.text).join(" "),
      }))
    );
  }, [transcript, videoId]);

  async function summarizeSections() {
    if (sectionSummaries.length === 0) {
      return;
    }

    setIsSummarizing(true);
    setCurrentSection(0);

    try {
      const updatedSummaries = [...sectionSummaries];
      for (let index = 0; index < updatedSummaries.length; index++) {
        setCurrentSection(index);
        const section = updatedSummaries[index];

        const summary = await summarizeWithRetry(section.text);
        updatedSummaries[index] = {
          ...section,
          summary: summary || "Failed to generate summary",
        };
        setSectionSummaries(updatedSummaries);
        if (videoId) {
          storeSummaries(videoId, updatedSummaries);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to summarize sections";
      console.error(errorMessage);
    } finally {
      setIsSummarizing(false);
      setIsSummarizeDone(true);
    }
  }

  return {
    summarizeSections,
    sectionSummaries,
    isSummarizing,
    isSummarizeDone,
    currentSection,
  };
}
