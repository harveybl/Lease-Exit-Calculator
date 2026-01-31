import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lease Tracker',
    short_name: 'Lease',
    description: 'Vehicle lease exit option comparison tool',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf7',  // warm off-white from Phase 2
    theme_color: '#0d9488',       // teal primary from Phase 2
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
