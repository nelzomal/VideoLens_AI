import { useState, useEffect } from "react";
import { useUrlChange } from "./useUrlChange";
import { useSummarize } from "./useSummarize";
import { TranscriptEntry } from "../types/transcript";

export function useSectionSummaries(sections: Array<Array<TranscriptEntry>>) {
  const { handleSummarize, getCachedSummary, getVideoId } = useSummarize();
  const [sectionSummaries, setSectionSummaries] = useState<
    Record<number, string>
  >({});
  const [currentSection, setCurrentSection] = useState<number | null>(null);
  const [failedSections, setFailedSections] = useState<number[]>([]);
  const [hasCachedSummaries, setHasCachedSummaries] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isCheckingCache, setIsCheckingCache] = useState(true);

  const loadCachedSummaries = async () => {
    setIsCheckingCache(true);
    const videoId = getVideoId();

    if (!videoId || sections.length === 0) {
      setIsInitialLoad(false);
      setIsCheckingCache(false);
      return;
    }

    const cached = await getCachedSummary(videoId);
    if (!cached) {
      setIsInitialLoad(false);
      setIsCheckingCache(false);
      return;
    }

    const matchingSummaries: Record<number, string> = {};
    let hasMatches = false;

    sections.forEach((section, index) => {
      const matchingCacheIndex = cached.sections.findIndex(
        (cachedSection) =>
          JSON.stringify(section) === JSON.stringify(cachedSection)
      );

      if (matchingCacheIndex !== -1) {
        matchingSummaries[index] = cached.sectionSummaries[matchingCacheIndex];
        hasMatches = true;
      }
    });

    if (hasMatches) {
      setSectionSummaries(matchingSummaries);
      setHasCachedSummaries(true);
    }

    setIsInitialLoad(false);
    setIsCheckingCache(false);
  };

  const summarizeSection = async (sectionIndex: number) => {
    setCurrentSection(sectionIndex);
    const sectionText = sections[sectionIndex]
      .map((entry) => entry.text)
      .join(" ");
    const sectionSummary = await handleSummarize(sectionText, [
      sections[sectionIndex],
    ]);

    if (sectionSummary) {
      setSectionSummaries((prev) => ({
        ...prev,
        [sectionIndex]: sectionSummary,
      }));
      return true;
    }

    setFailedSections((prev) => [...prev, sectionIndex]);
    return false;
  };

  const handleSummarizeAll = async () => {
    setFailedSections([]);
    setHasCachedSummaries(false);

    try {
      for (let i = 0; i < sections.length; i++) {
        await summarizeSection(i);
      }
    } catch (error) {
      console.error("Error during summarization:", error);
    } finally {
      setCurrentSection(null);
    }
  };

  const handleRetrySections = async () => {
    const sectionsToRetry = [...failedSections];
    setFailedSections([]);

    for (const sectionIndex of sectionsToRetry) {
      await summarizeSection(sectionIndex);
    }
    setCurrentSection(null);
  };

  useEffect(() => {
    loadCachedSummaries();
  }, [sections.length]);

  useUrlChange(() => {
    setSectionSummaries({});
    setCurrentSection(null);
    setFailedSections([]);
    setHasCachedSummaries(false);
    setIsInitialLoad(true);
    setIsCheckingCache(true);
  });

  return {
    sectionSummaries,
    currentSection,
    failedSections,
    hasCachedSummaries,
    isInitialLoad,
    isCheckingCache,
    handleSummarizeAll,
    handleRetrySections,
  };
}
