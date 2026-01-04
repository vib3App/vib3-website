export interface ScanResult {
  type: 'user' | 'video' | 'link' | 'unknown';
  value: string;
  rawData: string;
}

export function parseQRData(data: string): ScanResult {
  // Check for VIB3 user profile links
  const userMatch = data.match(/(?:vib3\.app|localhost:\d+)\/profile\/([a-zA-Z0-9_-]+)/);
  if (userMatch) {
    return { type: 'user', value: userMatch[1], rawData: data };
  }

  // Check for VIB3 video links
  const videoMatch = data.match(/(?:vib3\.app|localhost:\d+)\/video\/([a-zA-Z0-9_-]+)/);
  if (videoMatch) {
    return { type: 'video', value: videoMatch[1], rawData: data };
  }

  // Check for generic URLs
  if (data.startsWith('http://') || data.startsWith('https://')) {
    return { type: 'link', value: data, rawData: data };
  }

  // Unknown QR data - might be a username
  if (/^[a-zA-Z0-9_]+$/.test(data)) {
    return { type: 'user', value: data, rawData: data };
  }

  return { type: 'unknown', value: data, rawData: data };
}
