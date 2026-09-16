/**
 * The cities the site names, placed on the map's projection: longitude
 * 112–155 → x 0–100 and latitude 10–44 → y 0–100, so a city sits where it
 * really is. `label` says which side its name goes on the drawing.
 */
/* west to east: the order the pins drop in */
export const CITIES = [
  { name: 'Perth', slug: 'perth', x: 9, y: 64.7, label: 'end' },
  { name: 'Adelaide', slug: 'adelaide', x: 61.9, y: 73.2, label: 'below' },
  { name: 'Melbourne', slug: 'melbourne', x: 76.7, y: 81.8, label: 'below' },
  { name: 'Sydney', slug: 'sydney', x: 91.2, y: 70.3, label: 'start' },
  { name: 'Brisbane', slug: 'brisbane', x: 95.8, y: 51.5, label: 'start' },
  { name: 'Gold Coast', slug: 'gold-coast', x: 96.4, y: 54.3, label: 'start-below' },
]

