export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: boolean;
}

export const mainNavItems: NavItem[] = [
  { href: '/feed', label: 'For You', icon: 'home' },
  { href: '/following', label: 'Following', icon: 'users' },
  { href: '/discover', label: 'Discover', icon: 'compass' },
  { href: '/live', label: 'LIVE', icon: 'live', badge: true },
];

export const featureNavItems: NavItem[] = [
  { href: '/collab', label: 'Collab Rooms', icon: 'collab' },
  { href: '/watch-party', label: 'Watch Party', icon: 'party' },
  { href: '/capsule', label: 'Time Capsules', icon: 'capsule' },
  { href: '/collections', label: 'Collections', icon: 'collections' },
  { href: '/challenges', label: 'Challenges', icon: 'trophy' },
];

export const creatorNavItems: NavItem[] = [
  { href: '/upload', label: 'Upload', icon: 'upload' },
  { href: '/camera', label: 'Camera', icon: 'camera' },
  { href: '/creator', label: 'Creator Studio', icon: 'studio' },
];

export const moreNavItems: NavItem[] = [
  { href: '/coins', label: 'VIB3 Coins', icon: 'coins' },
  { href: '/shop', label: 'Shop', icon: 'shop' },
  { href: '/analytics', label: 'Analytics', icon: 'analytics' },
  { href: '/creator-fund', label: 'Creator Fund', icon: 'fund' },
  { href: '/messages', label: 'Messages', icon: 'message' },
  { href: '/notifications', label: 'Notifications', icon: 'bell' },
];
