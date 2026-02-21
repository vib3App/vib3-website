export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  duration: number;
  viewCount: number;
  reactions: StoryReaction[];
  isViewed: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface StoryGroup {
  userId: string;
  username: string;
  userAvatar?: string;
  stories: Story[];
  hasUnviewed: boolean;
  latestAt: string;
}

export interface StoryReaction {
  id: string;
  userId: string;
  username: string;
  emoji: string;
  createdAt: string;
}

export interface StoryViewerProfile {
  userId: string;
  username: string;
  avatar?: string;
  viewedAt: string;
}

export interface CreateStoryInput {
  mediaFile: File;
  mediaType: 'image' | 'video';
  caption?: string;
  duration?: number;
}
