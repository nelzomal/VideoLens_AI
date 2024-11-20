export interface TranscriptEntry {
  text: string;
  start: number;
}

export interface TranscriptResponse {
  items: {
    id: string;
    snippet: {
      videoId: string;
      lastUpdated: string;
      trackKind: string;
      language: string;
      name: string;
      audioTrackType: string;
      isCC: boolean;
      isLarge: boolean;
      isEasyReader: boolean;
      isDraft: boolean;
      isAutoSynced: boolean;
      status: string;
    };
  }[];
}
