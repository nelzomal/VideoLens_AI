import { useState, useEffect } from "react";

export function useVideoId() {
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    const url = window.location.href;
    const urlParams = new URLSearchParams(new URL(url).search);
    setVideoId(urlParams.get("v") || null);
  }, []);

  return videoId;
}
