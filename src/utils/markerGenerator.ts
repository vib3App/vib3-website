/**
 * Enhanced marker generator for creating custom-styled map markers
 * Generates SVG data URIs with user avatars and custom styles
 */

export interface MarkerStyle {
  borderColor: string;
  backgroundColor: string;
  size: number;
  shape: 'circle' | 'rounded-square' | 'hexagon';
  showPulse: boolean;
  pulseColor: string;
}

const DEFAULT_STYLE: MarkerStyle = {
  borderColor: '#a855f7',
  backgroundColor: '#1a1a2e',
  size: 44,
  shape: 'circle',
  showPulse: false,
  pulseColor: '#a855f7',
};

/**
 * Generate a gradient color based on username for consistent avatar coloring
 */
export function getUserColor(username: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360;
  return [
    `hsl(${hue1}, 70%, 50%)`,
    `hsl(${hue2}, 70%, 50%)`,
  ];
}

/**
 * Generate an SVG marker as a data URI string
 */
export function generateMarkerSVG(
  initial: string,
  isOnline: boolean,
  isFavorite: boolean,
  customStyle?: Partial<MarkerStyle>
): string {
  const style = { ...DEFAULT_STYLE, ...customStyle };
  const s = style.size;
  const half = s / 2;

  const borderColor = isOnline ? '#4ade80' : style.borderColor;
  const favStar = isFavorite
    ? `<text x="${s - 6}" y="10" text-anchor="middle" fill="#facc15" font-size="10">★</text>`
    : '';

  const onlineIndicator = isOnline
    ? `<circle cx="${s - 6}" cy="${s - 6}" r="5" fill="#4ade80" stroke="${style.backgroundColor}" stroke-width="2"/>`
    : '';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s + 12}" viewBox="0 0 ${s} ${s + 12}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#a855f7"/>
          <stop offset="100%" stop-color="#14b8a6"/>
        </linearGradient>
      </defs>
      <circle cx="${half}" cy="${half}" r="${half - 2}" fill="url(#g)" stroke="${borderColor}" stroke-width="2.5"/>
      <text x="${half}" y="${half + 5}" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="system-ui">${initial}</text>
      ${onlineIndicator}
      ${favStar}
      <polygon points="${half},${s + 10} ${half - 5},${s - 2} ${half + 5},${s - 2}" fill="${borderColor}"/>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate CSS styles for animated markers
 */
export function getMarkerAnimationCSS(): string {
  return `
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .animate-pulse-ring {
      animation: pulse-ring 2s ease-out infinite;
    }
    .animate-bounce-slow {
      animation: bounce-slow 2s ease-in-out infinite;
    }
  `;
}

/**
 * Get marker scale multiplier based on interaction count
 * More interactions = slightly larger marker
 */
export function getInteractionScale(count: number): number {
  if (count <= 0) return 1;
  if (count < 5) return 1.05;
  if (count < 20) return 1.1;
  return 1.15;
}
