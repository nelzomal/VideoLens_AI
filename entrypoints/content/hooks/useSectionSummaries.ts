import { useState, useEffect, useCallback } from "react";
import { useUrlChange } from "./useUrlChange";
import { useSummarize } from "./useSummarize";
import { TranscriptEntry } from "../types/transcript";
import debounce from "lodash/debounce";

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
  const [isSummarizing, setIsSummarizing] = useState(false);

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
    // First check if we already have this summary
    if (sectionSummaries[sectionIndex]) {
      return true;
    }

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

  const handleSummarizeAll = useCallback(
    debounce(async () => {
      // Get sections that need summarizing
      const sectionsToProcess = sections.reduce((acc: number[], _, index) => {
        if (!sectionSummaries[index]) {
          acc.push(index);
        }
        return acc;
      }, []);

      if (sectionsToProcess.length === 0) {
        return;
      }

      setFailedSections([]);
      setIsSummarizing(true);

      try {
        for (const sectionIndex of sectionsToProcess) {
          await summarizeSection(sectionIndex);
        }
      } catch (error) {
        console.error("Error during summarization:", error);
      } finally {
        setCurrentSection(null);
        setIsSummarizing(false);
      }
    }, 500),
    [sections, sectionSummaries]
  );

  const handleRetrySections = async () => {
    const sectionsToRetry = [...failedSections];
    setFailedSections([]);

    for (const sectionIndex of sectionsToRetry) {
      await summarizeSection(sectionIndex);
    }
    setCurrentSection(null);
  };

  const resetState = () => {
    setSectionSummaries({});
    setCurrentSection(null);
    setFailedSections([]);
    setHasCachedSummaries(false);
    setIsInitialLoad(true);
    setIsCheckingCache(true);
  };

  useEffect(() => {
    loadCachedSummaries();
  }, [sections.length]);

  useUrlChange(() => {
    resetState();
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === null) {
        resetState();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    sectionSummaries,
    currentSection,
    failedSections,
    hasCachedSummaries,
    isInitialLoad,
    isCheckingCache,
    isSummarizing,
    handleSummarizeAll,
    handleRetrySections,
  };
}
