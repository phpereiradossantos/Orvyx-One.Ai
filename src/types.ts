export interface SummaryData {
  mainIdea: string;
  keyPoints: string[];
  practicalConclusion: string;
  keyTerms?: string[];
}

export type FeedbackType = 'positive' | 'negative' | null;

export interface SummaryFeedback {
  type: FeedbackType;
  rating?: number; // 1 to 5 stars
  comment?: string;
  timestamp?: number;
}

export interface VideoMeta {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'twitter' | 'web';
  title?: string;
  author?: string;
  thumbnail?: string;
  url: string;
}

export interface UploadedVideoFile {
  name: string;
  size: number;
  type: string;
  base64?: string;
  previewUrl?: string;
  duration?: number;
}

export interface SummaryRecord {
  id: string;
  title: string;
  originalText: string;
  summary: SummaryData;
  createdAt: number;
  wordCountOriginal: number;
  modelUsed: string;
  feedback?: SummaryFeedback;
  videoUrl?: string;
  videoInfo?: VideoMeta;
  uploadedVideo?: {
    name: string;
    size: number;
    type: string;
    duration?: number;
  };
}

export interface AppConfig {
  apiKey: string;
  model: string;
  systemInstruction: string;
  tone: 'balanced' | 'executive' | 'didactic' | 'concise';
}
