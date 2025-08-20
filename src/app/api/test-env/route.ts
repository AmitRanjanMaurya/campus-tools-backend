import { NextResponse } from 'next/server'

export async function GET() {
  // Test endpoint to check environment variables
  const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY
  const keyLength = process.env.OPENROUTER_API_KEY?.length || 0
  
  return NextResponse.json({
    hasOpenRouterKey,
    keyLength,
    // Don't expose the actual key for security
    keyPreview: process.env.OPENROUTER_API_KEY ? 
      process.env.OPENROUTER_API_KEY.substring(0, 10) + '...' : 
      'No key found'
  })
}
