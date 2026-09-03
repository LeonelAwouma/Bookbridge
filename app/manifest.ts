import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BookBridge — Give Your Books a Second Life',
    short_name: 'BookBridge',
    description: 'Donate books to students and schools near you, or find books your community needs.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbfaf7',
    theme_color: '#fbfaf7',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
