/**
 * Time Capsule types - Videos that unlock at a future date
 */

export type CapsuleStatus = 'sealed' | 'unlocking' | 'unlocked' | 'expired';

export interface TimeCapsule {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorAvatar?: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  videoUrl?: string; // Only available when unlocked
  thumbnailUrl?: string;
  status: CapsuleStatus;
  unlockAt: string;
  unlockedAt?: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isPrivate: boolean;
  recipientIds?: string[]; // For private capsules sent to specific users
  recipientUsernames?: string[];
  previewEnabled: boolean;
  previewSeconds?: number;
  notifyOnUnlock: boolean;
}

export interface CreateCapsuleInput {
  title: string;
  description?: string;
  coverImageUrl?: string;
  videoFile?: File;
  videoUrl?: string;
  unlockAt: string;
  isPrivate?: boolean;
  recipientIds?: string[];
  previewEnabled?: boolean;
  previewSeconds?: number;
  notifyOnUnlock?: boolean;
}

export interface CapsuleReveal {
  capsuleId: string;
  capsuleTitle: string;
  creatorUsername: string;
  creatorAvatar?: string;
  unlockAt: string;
  subscriberCount: number;
  isSubscribed: boolean;
}
