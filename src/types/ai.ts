/**
 * AI feature types
 */

export interface AICaption {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
  language: string;
}

export interface AITranscript {
  videoId: string;
  language: string;
  captions: AICaption[];
  duration: number;
  generatedAt: string;
}

export interface ContentModerationResult {
  videoId: string;
  isApproved: boolean;
  score: number; // 0-1, higher is safer
  flags: ModerationFlag[];
  reviewRequired: boolean;
  moderatedAt: string;
}

export interface ModerationFlag {
  type: 'violence' | 'adult' | 'hate_speech' | 'spam' | 'misinformation' | 'copyright';
  confidence: number;
  description: string;
  timestamp?: number; // For video content
}

export interface AIRecommendation {
  videoId: string;
  score: number;
  reason: RecommendationReason;
  metadata: Record<string, unknown>;
}

export type RecommendationReason =
  | 'watch_history'
  | 'liked_content'
  | 'followed_creator'
  | 'trending'
  | 'similar_users'
  | 'topic_interest';

export interface SmartSearchResult {
  type: 'video' | 'user' | 'hashtag' | 'topic';
  id: string;
  title: string;
  description?: string;
  relevanceScore: number;
  matchedTerms: string[];
  semanticMatch?: boolean;
}

export interface AIFilter {
  id: string;
  name: string;
  description: string;
  type: 'face' | 'background' | 'style' | 'enhancement';
  previewUrl: string;
  parameters?: Record<string, number | string>;
}

export interface FaceDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  landmarks?: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    nose: { x: number; y: number };
    leftMouth: { x: number; y: number };
    rightMouth: { x: number; y: number };
  };
}

export interface ObjectDetection {
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface VideoAnalysis {
  videoId: string;
  duration: number;
  scenes: SceneAnalysis[];
  objects: ObjectDetection[];
  faces: FaceDetection[];
  dominantColors: string[];
  audioAnalysis?: AudioAnalysis;
}

export interface SceneAnalysis {
  startTime: number;
  endTime: number;
  description: string;
  labels: string[];
  mood?: string;
}

export interface AudioAnalysis {
  speechRatio: number; // Percentage of audio that is speech
  musicDetected: boolean;
  loudnessLevels: number[];
  language?: string;
}

export interface AISettings {
  autoCaption: boolean;
  captionLanguage: string;
  contentModeration: boolean;
  personalizedRecommendations: boolean;
  smartFilters: boolean;
  faceBeautification: boolean;
  backgroundBlur: boolean;
}
