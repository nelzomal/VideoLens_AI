import { useState, useEffect } from "react";
import { summarizeText } from "@/entrypoints/content/lib/summarize";
import { groupTranscriptIntoSections } from "../utils";
import { withRetry } from "@/lib/utils";
import { TranscriptEntry } from "@/entrypoints/content/types/transcript";

export interface SectionSummary {
  startTime: number;
  endTime: number;
  summary: string;
}

interface UseSummarizeProps {
  transcript?: Array<TranscriptEntry>;
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
export function useSummarize(props?: UseSummarizeProps) {
  const [sections, setSections] = useState<Array<TranscriptEntry[]>>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSummarizeDone, setIsSummarizeDone] = useState(false);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [sectionSummaries, setSectionSummaries] = useState<SectionSummary[]>(
    []
  );

  useEffect(() => {
    if (!props?.transcript) {
      setSections([]);
      setSectionSummaries([]);
      return;
    }

    const groupedSections = groupTranscriptIntoSections(props.transcript);
    setSections(groupedSections);
  }, [props?.transcript]);

  async function summarizeSections() {
    if (sections.length === 0) {
      return;
    }

    setIsSummarizing(true);
    setCurrentSection(0);

    try {
      setSectionSummaries(
        sections.map((section) => ({
          startTime: section[0].start,
          endTime: section[section.length - 1].start,
          summary: "",
        }))
      );

      for (let index = 0; index < sections.length; index++) {
        setCurrentSection(index);
        const section = sections[index];
        const sectionText = section.map((entry) => entry.text).join(" ");

        try {
          const summary = await summarizeWithRetry(sectionText);

          setSectionSummaries((prevSummaries) => {
            const newSummaries = [...prevSummaries];
            newSummaries[index] = {
              startTime: section[0].start,
              endTime: section[section.length - 1].start,
              summary: summary || "Failed to generate summary",
            };
            return newSummaries;
          });
        } catch (sectionError) {
          setSectionSummaries((prevSummaries) => {
            const newSummaries = [...prevSummaries];
            newSummaries[index] = {
              startTime: section[0].start,
              endTime: section[section.length - 1].start,
              summary: "Failed to generate summary",
            };
            return newSummaries;
          });
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
