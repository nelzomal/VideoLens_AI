import { TranscriptEntry } from "../types/transcript";

export const sendMessageToBackground = (
  message: MainPage.MessageToBackground
) => {
  browser.runtime.sendMessage({ ...message, source: "content" });
};

export async function getYouTubeTranscript(): Promise<TranscriptEntry[]> {
  console.log("Attempting to get YouTube transcript...");

  const transcriptButton = document.querySelector(
    'button[aria-label="Show transcript"]'
  ) as HTMLButtonElement;

  if (!transcriptButton) {
    console.log("No transcript button found");
    return [];
  }

  try {
    // Click to open transcript
    transcriptButton.click();

    // Wait for transcript to load
    const entries = await new Promise<TranscriptEntry[]>((resolve) => {
      setTimeout(() => {
        const transcriptSegments = document.querySelectorAll(
          "ytd-transcript-segment-renderer"
        );

        if (transcriptSegments.length === 0) {
          console.log("No transcript segments found");
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
          console.log("timestamp:", timestamp);

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

    return entries;
  } catch (error) {
    console.error("Error getting transcript:", error);
    return [];
  }
}
