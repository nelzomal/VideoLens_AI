interface ChromeMediaTrackConstraints extends MediaTrackConstraints {
  chromeMediaSource?: string;
  chromeMediaSourceId?: string;
}

declare global {
  interface MediaTrackConstraints extends ChromeMediaTrackConstraints {}
}

interface Position {
  x: number;
  y: number;
}
