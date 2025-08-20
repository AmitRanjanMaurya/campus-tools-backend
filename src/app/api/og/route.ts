import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Student Tools Hub'
    const description = searchParams.get('description') || 'Free online tools for students'

    // For now, return a simple SVG response
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#bg)"/>
        <rect x="60" y="120" width="1080" height="390" rx="20" fill="white" opacity="0.95"/>
        <text x="600" y="250" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#1e40af" text-anchor="middle">${title}</text>
        <text x="600" y="320" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">${description}</text>
        <text x="600" y="420" font-family="Arial, sans-serif" font-size="20" fill="#1e40af" text-anchor="middle">🎓 StudentTools.dev</text>
      </svg>
    `

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e) {
    console.error('Failed to generate OG image:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}
