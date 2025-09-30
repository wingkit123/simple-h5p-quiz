// Central definition of H5P activities
export const H5P_ACTIVITIES = [
  {
    slug: 'personality-quiz', // URL-safe slug for path construction
    title: 'Personality Quiz',
    summary: 'Interactive personality assessment to discover your unique traits and characteristics.',
    embedType: 'iframe', // Using div as specified in h5p.json
    debug: true
  }
];

export const H5P_PLAYER_BASE = import.meta.env.VITE_H5P_PLAYER_BASE || '/assets/h5p-player';
export const H5P_CONTENT_BASE = import.meta.env.VITE_H5P_CONTENT_BASE || '/h5p';