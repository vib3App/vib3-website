export interface Sound {
  id: string;
  _id?: string;
  name: string;
  artist?: string;
  url?: string;
  audioUrl?: string;
  coverUrl?: string;
  duration: number;
  useCount: number;
  creatorId?: string;
  creatorUsername?: string;
  createdAt: string;
}

export interface MusicTrack {
  id: string;
  _id?: string;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  previewUrl?: string;
  isExplicit: boolean;
  plays: number;
  likes: number;
  category: MusicCategory;
  tags: string[];
  isOriginalSound: boolean;
  originalVideoId?: string;
  originalUsername?: string;
  addedAt?: string;
  isSaved: boolean;
  isPremium: boolean;
  metadata?: {
    bpm?: number;
    key?: string;
  };
}

export interface OriginalSound {
  id: string;
  _id?: string;
  creatorId: string;
  creatorUsername: string;
  creatorProfileImage?: string;
  sourceVideoId: string;
  name: string;
  audioUrl: string;
  coverImageUrl?: string;
  duration: number;
  usageCount: number;
  saveCount: number;
  isPublic: boolean;
  isSaved: boolean;
  createdAt: string;
}

export type MusicCategory =
  | 'Trending'
  | 'Pop'
  | 'Hip Hop'
  | 'Electronic'
  | 'Rock'
  | 'R&B'
  | 'Country'
  | 'Latin'
  | 'K-Pop'
  | 'Indie'
  | 'Classical'
  | 'Jazz'
  | 'Sound Effects'
  | 'Original Sounds'
  | 'Viral'
  | 'Mood'
  | 'Workout'
  | 'Chill'
  | 'Party'
  | 'Love';

export const MUSIC_CATEGORIES: MusicCategory[] = [
  'Trending',
  'Pop',
  'Hip Hop',
  'Electronic',
  'Rock',
  'R&B',
  'Country',
  'Latin',
  'K-Pop',
  'Indie',
  'Classical',
  'Jazz',
  'Sound Effects',
  'Original Sounds',
  'Viral',
  'Mood',
  'Workout',
  'Chill',
  'Party',
  'Love',
];

export interface SoundSearchResult {
  sounds: Sound[];
  hasMore: boolean;
  total?: number;
}

export interface MusicSearchResult {
  tracks: MusicTrack[];
  hasMore: boolean;
  page: number;
  total?: number;
}
