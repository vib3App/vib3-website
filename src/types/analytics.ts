/**
 * Analytics types - Creator analytics and stats
 */

export interface TopVideo {
  _id: string;
  title: string;
  thumbnail?: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface Demographics {
  '13-17': number;
  '18-24': number;
  '25-34': number;
  '35-44': number;
  '45+': number;
}

export interface TrafficSources {
  forYou: number;
  following: number;
  profile: number;
  search: number;
  other: number;
}

export interface AnalyticsDashboard {
  // Views
  totalViews: number;
  viewsChange: number;
  profileViews: number;
  profileViewsChange: number;

  // Engagement
  totalLikes: number;
  likesChange: number;
  totalComments: number;
  commentsChange: number;
  totalShares: number;
  sharesChange: number;

  // Followers
  newFollowers: number;
  followersChange: number;
  totalFollowers: number;

  // History (daily data points)
  viewsHistory: number[];
  engagementHistory: number[];

  // Top content
  topVideos: TopVideo[];

  // Audience demographics
  demographics: Demographics;
  genderMale: number;
  genderFemale: number;

  // Traffic
  trafficSources: TrafficSources;

  // Performance metrics
  avgWatchTime: number;
  completionRate: number;
  bestPostingTime: string;
}

export type AnalyticsPeriod = 7 | 30 | 90 | 365;
