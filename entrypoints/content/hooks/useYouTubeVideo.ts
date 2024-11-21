import { useState, useEffect } from "react";
import { useUrlChange } from "./useUrlChange";

export const useYouTubeVideo = () => {
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);

  const checkYouTubeVideo = () => {
    try {
      const currentUrl = window.location.href;
      const isVideoPage = currentUrl.includes("youtube.com/watch");
      setIsYouTubeVideo(isVideoPage);
    } catch (error) {
      console.error("Error checking YouTube video:", error);
      setIsYouTubeVideo(false);
    }
  };

  useEffect(() => {
    checkYouTubeVideo();
  }, []);

  useUrlChange(checkYouTubeVideo);

  return { isYouTubeVideo };
};
