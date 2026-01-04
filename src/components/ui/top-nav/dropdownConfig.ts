export interface DropdownItem {
  href: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface DropdownConfig {
  id: string;
  label: string;
  items: DropdownItem[];
}

export const DROPDOWNS: DropdownConfig[] = [
  {
    id: 'create',
    label: 'Create',
    items: [
      { href: '/upload', label: 'Upload', icon: '📤', description: 'Upload a video' },
      { href: '/camera', label: 'Camera', icon: '📸', description: 'Record now' },
      { href: '/creator', label: 'Creator Studio', icon: '🎬', description: 'Manage your content' },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    items: [
      { href: '/collab', label: 'Collab Rooms', icon: '🤝', description: 'Create together' },
      { href: '/watch-party', label: 'Watch Party', icon: '🎉', description: 'Watch with friends' },
      { href: '/challenges', label: 'Challenges', icon: '🏆', description: 'Join trending challenges' },
    ],
  },
  {
    id: 'library',
    label: 'Library',
    items: [
      { href: '/collections', label: 'Collections', icon: '📁', description: 'Your saved playlists' },
      { href: '/liked', label: 'Liked Videos', icon: '❤️', description: 'Videos you loved' },
      { href: '/history', label: 'Watch History', icon: '🕐', description: 'Recently watched' },
    ],
  },
  {
    id: 'messages',
    label: 'Messages',
    items: [
      { href: '/messages', label: 'Messages', icon: '💬', description: 'Direct messages' },
      { href: '/capsule', label: 'Time Capsules', icon: '⏰', description: 'Messages to the future' },
      { href: '/notifications', label: 'Notifications', icon: '🔔', description: 'System notifications' },
    ],
  },
  {
    id: 'earn',
    label: 'Earn',
    items: [
      { href: '/coins', label: 'VIB3 Coins', icon: '🪙', description: 'Your coin balance' },
      { href: '/creator-fund', label: 'Creator Fund', icon: '💰', description: 'Monetization' },
      { href: '/shop', label: 'Shop', icon: '🛍️', description: 'Buy and sell' },
      { href: '/analytics', label: 'Analytics', icon: '📊', description: 'Your stats' },
    ],
  },
];
