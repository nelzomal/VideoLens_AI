export interface TranscriptEntry {
  start: number;
  text: string;
  translation?: string | null;
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
