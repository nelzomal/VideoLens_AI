import { useSummarize } from "../hooks/useSummarize";
import { usePersistedTranscript } from "../hooks/usePersistedTranscript";
import { useState, useEffect } from "react";

export function SummarizeView() {
  const { transcript } = usePersistedTranscript();
  const { isLoading, progress, handleSummarize, getCachedSummary, getVideoId } =
    useSummarize();
  const [sectionSummaries, setSectionSummaries] = useState<{
    [key: number]: string;
  }>({});
  const [currentSection, setCurrentSection] = useState<number | null>(null);
  const [failedSections, setFailedSections] = useState<number[]>([]);
  const [hasCachedSummaries, setHasCachedSummaries] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isCheckingCache, setIsCheckingCache] = useState(true);

  const sections = transcript
    ? groupTranscriptIntoSections(transcript, 300)
    : [];

  useEffect(() => {
    const loadCachedSummaries = async () => {
      setIsCheckingCache(true);
      const videoId = getVideoId();

      if (videoId && sections.length > 0) {
        const cached = await getCachedSummary(videoId);

        if (cached) {
          const matchingSummaries: { [key: number]: string } = {};
          let hasMatches = false;

          sections.forEach((section, index) => {
            const matchingCacheIndex = cached.sections.findIndex(
              (cachedSection) =>
                JSON.stringify(section) === JSON.stringify(cachedSection)
            );

            if (matchingCacheIndex !== -1) {
              matchingSummaries[index] =
                cached.sectionSummaries[matchingCacheIndex];
              hasMatches = true;
            }
          });

          if (hasMatches) {
            setSectionSummaries(matchingSummaries);
            setHasCachedSummaries(true);
          }
        }
      }
      setIsInitialLoad(false);
      setIsCheckingCache(false);
    };

    loadCachedSummaries();
  }, [sections.length]);

  const handleSummarizeAll = async () => {
    setFailedSections([]);
    setHasCachedSummaries(false);
    try {
      for (let i = 0; i < sections.length; i++) {
        setCurrentSection(i);
        const sectionText = sections[i].map((entry) => entry.text).join(" ");
        const sectionSummary = await handleSummarize(sectionText, [
          sections[i],
        ]);

        if (sectionSummary) {
          setSectionSummaries((prev) => ({
            ...prev,
            [i]: sectionSummary,
          }));
        } else {
          setFailedSections((prev) => [...prev, i]);
        }
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
      } else {
        setFailedSections((prev) => [...prev, sectionIndex]);
      }
    }
    setCurrentSection(null);
  };

  const handleTimeClick = (timestamp: number) => {
    const videoElement = document.querySelector("video");
    if (videoElement) {
      videoElement.currentTime = timestamp;
    }
  };

  return (
    <div className="space-y-4 p-4 text-white">
      <h2 className="text-lg font-medium">Transcript Summary</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          {!isCheckingCache &&
            !isInitialLoad &&
            sections.some((_, index) => !sectionSummaries[index]) && (
              <button
                className={`px-4 py-2 rounded ${
                  isLoading || sections.length === 0
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={handleSummarizeAll}
                disabled={isLoading || sections.length === 0}
              >
                {Object.keys(sectionSummaries).length > 0
                  ? "Continue Summarizing"
                  : "Summarize Transcript"}
              </button>
            )}
          {sections.length === 0 &&
            !hasCachedSummaries &&
            Object.keys(sectionSummaries).length === 0 && (
              <div className="text-gray-400">Loading transcript...</div>
            )}
          {isLoading && currentSection !== null && (
            <div className="text-gray-400">
              Summarizing Section {(currentSection || 0) + 1}...
            </div>
          )}
          {failedSections.length > 0 && (
            <button
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              onClick={handleRetrySections}
              disabled={isLoading}
            >
              Retry Failed Sections ({failedSections.length})
            </button>
          )}
        </div>

        {isLoading && progress.total > 0 && (
          <div>
            Loading model:{" "}
            {Math.round((progress.loaded / progress.total) * 100)}%
          </div>
        )}

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {sections.map((section, index) => {
            const summary = sectionSummaries[index];
            if (!summary) return null;

            const startTime = section[0].start;
            const endTime = section[section.length - 1].start;

            return (
              <div key={index} className="mt-4">
                <h3 className="text-md font-medium flex items-center gap-2">
                  <span
                    className="text-blue-400 cursor-pointer hover:text-blue-300"
                    onClick={() => handleTimeClick(startTime)}
                  >
                    {formatTime(startTime)}
                  </span>
                  <span className="text-gray-400">-</span>
                  <span
                    className="text-blue-400 cursor-pointer hover:text-blue-300"
                    onClick={() => handleTimeClick(endTime)}
                  >
                    {formatTime(endTime)}
                  </span>
                </h3>
                <div className="bg-gray-800 p-2 rounded mt-2 whitespace-pre-wrap">
                  {summary.split("* ").map((point, i) => {
                    if (!point.trim()) return null;
                    return (
                      <div key={i} className="mb-2">
                        <span className="text-gray-400">•</span>{" "}
                        {point.replace(/\*\*/g, "").trim()}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function groupTranscriptIntoSections(
  transcript: Array<{ start: number; text: string }>,
  sectionLength: number
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
