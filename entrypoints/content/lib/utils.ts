import { languages, type Language } from "@/lib/constants";
import { TranscriptEntry } from "../types/transcript";

function addTemporaryStyle(css: string): () => void {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}

export const sendMessageToBackground = (
  message: MainPage.MessageToBackground
) => {
  browser.runtime.sendMessage({ ...message, source: "content" });
};

export async function getYouTubeTranscript(): Promise<TranscriptEntry[]> {
  const transcriptButton = document.querySelector(
    'button[aria-label="Show transcript"]'
  ) as HTMLButtonElement;

  if (!transcriptButton) {
    return [];
  }

  try {
    // Add temporary style to hide the transcript panel
    const removeStyle = addTemporaryStyle(`
      ytd-engagement-panel-section-list-renderer {
        opacity: 0 !important;
        position: fixed !important;
        z-index: -1 !important;
      }
    `);

    // Click to open transcript
    transcriptButton.click();

    // Wait for transcript to load
    const entries = await new Promise<TranscriptEntry[]>((resolve) => {
      setTimeout(() => {
        const transcriptSegments = document.querySelectorAll(
          "ytd-transcript-segment-renderer"
        );

        if (transcriptSegments.length === 0) {
          resolve([]);
          return;
        }

        const transcript = Array.from(transcriptSegments).map((segment) => {
          // Try multiple selectors for timestamp
          const timestampElement =
            segment.querySelector(".segment-timestamp") ||
            segment.querySelector(".segment-start-offset") ||
            segment.querySelector('[id="timestamp"]');

          const timestamp = timestampElement
            ? timestampElement.textContent?.trim() || "0:00"
            : "0:00";

          // Try multiple selectors for text
          const textElement =
            segment.querySelector(".segment-text") ||
            segment.querySelector(
              "yt-formatted-string.ytd-transcript-segment-renderer"
            ) ||
            segment.querySelector('[id="segment-text"]');

          const text = textElement ? textElement.textContent?.trim() || "" : "";

          // Convert timestamp (MM:SS) to seconds
          const [minutes, seconds] = timestamp.split(":").map(Number);
          const startTime = minutes * 60 + seconds;

          return {
            text,
            start: startTime,
          };
        });

        resolve(transcript);
      }, 1500);
    });

    // Close the transcript panel
    const closeButton = document.querySelector(
      'button[aria-label="Close transcript"]'
    ) as HTMLButtonElement;

    if (closeButton) {
      closeButton.click();
    }

    // Remove the temporary style
    removeStyle();

    return entries;
  } catch (error) {
    return [];
  }
}

export const handleTranscriptClick = (timestamp: number) => {
  const video = document.querySelector("video");
  if (video) {
    video.currentTime = timestamp;
  }
};

export function getRandomString(strings: string[]): string {
  const randomIndex = Math.floor(Math.random() * strings.length);
  return strings[randomIndex];
}

export const checkVideoStatus = () => {
  const videoElement = document.querySelector("video");
  if (videoElement) {
    return !videoElement.paused && !videoElement.ended;
  }
  return false;
};

export const getLanguageCode = (
  language: Language
): TranslationLanguageCode => {
  return languages.find((l) => l.value === language)?.code || "en";
};
