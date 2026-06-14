export const CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:8000/storage',
  adsPosition: 2,
  sliderInterval: 4000,
  maxFavorisLocal: 10,
} as const
