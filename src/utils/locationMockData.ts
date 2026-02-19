/**
 * Mock data generators for location features
 * Used when API endpoints are not yet available
 */
import type { TicketmasterEvent, HeatmapPoint, NearbyPlace } from '@/types/location';

export function generateMockEvents(lat: number, lng: number): TicketmasterEvent[] {
  const templates = [
    { name: 'Live Music Night', type: 'music', category: 'Music', venueName: 'The Underground', city: 'Nearby', dlat: 0.005, dlng: 0.003 },
    { name: 'Comedy Showcase', type: 'comedy', category: 'Arts & Theatre', venueName: 'Laugh Factory', city: 'Downtown', dlat: -0.008, dlng: 0.006 },
    { name: 'Food & Wine Festival', type: 'festival', category: 'Food & Drink', venueName: 'City Park', city: 'Central', dlat: 0.012, dlng: -0.004 },
    { name: 'Tech Meetup', type: 'conference', category: 'Technology', venueName: 'Innovation Hub', city: 'Midtown', dlat: -0.003, dlng: -0.009 },
    { name: 'Art Exhibition Opening', type: 'art', category: 'Arts & Theatre', venueName: 'Gallery 42', city: 'Arts District', dlat: 0.007, dlng: 0.011 },
  ];

  return templates.map((t, i) => ({
    id: `mock-event-${i}`,
    name: t.name,
    type: t.type,
    category: t.category,
    url: '#',
    startDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    venue: {
      name: t.venueName,
      latitude: lat + t.dlat,
      longitude: lng + t.dlng,
      address: `${100 + i * 50} Main St`,
      city: t.city,
    },
    priceRange: { min: 15 + i * 10, max: 45 + i * 15, currency: 'USD' },
  }));
}

export function generateMockHeatmapPoints(lat: number, lng: number): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];
  // Generate a grid of points around the user's location
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      const distFromCenter = Math.sqrt(i * i + j * j);
      // Higher intensity near center with some random hotspots
      const isHotspot = (i === 2 && j === 1) || (i === -3 && j === 2) || (i === 1 && j === -2);
      const baseIntensity = Math.max(0, 1 - distFromCenter / 6);
      const intensity = isHotspot ? 0.9 + Math.random() * 0.1 : baseIntensity * (0.5 + Math.random() * 0.5);

      if (intensity > 0.05) {
        points.push({
          latitude: lat + i * 0.002,
          longitude: lng + j * 0.002,
          intensity: Math.min(1, intensity),
        });
      }
    }
  }
  return points;
}

export function generateMockPOIs(lat: number, lng: number): NearbyPlace[] {
  const pois: Array<{ name: string; category: string; rating: number }> = [
    { name: 'Blue Bottle Coffee', category: 'Cafe', rating: 4.5 },
    { name: 'Central Park', category: 'Park', rating: 4.8 },
    { name: 'Whole Foods Market', category: 'Grocery', rating: 4.2 },
    { name: 'Planet Fitness', category: 'Gym', rating: 4.0 },
    { name: 'The Bookshelf', category: 'Bookstore', rating: 4.7 },
    { name: 'Sakura Sushi', category: 'Restaurant', rating: 4.4 },
    { name: 'City Library', category: 'Library', rating: 4.6 },
    { name: 'Metro Station', category: 'Transit', rating: 3.8 },
  ];

  return pois.map((poi, i) => {
    const angle = (i / pois.length) * Math.PI * 2;
    const dist = 0.002 + Math.random() * 0.008;
    const pLat = lat + Math.cos(angle) * dist;
    const pLng = lng + Math.sin(angle) * dist;
    return {
      id: `mock-poi-${i}`,
      name: poi.name,
      category: poi.category,
      latitude: pLat,
      longitude: pLng,
      distance: Math.round(dist * 111000), // rough meters
      rating: poi.rating,
    };
  });
}
