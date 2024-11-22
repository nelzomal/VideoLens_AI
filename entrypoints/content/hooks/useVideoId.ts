import { useState, useEffect } from "react";

export function useVideoId() {
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    const getVideoIdFromUrl = () => {
      const url = window.location.href;
      const urlParams = new URLSearchParams(new URL(url).search);
      return urlParams.get("v") || null;
    };

    setVideoId(getVideoIdFromUrl());
  }, []);

  return videoId;
}
