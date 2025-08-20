// Admin authentication middleware
import { NextRequest, NextResponse } from 'next/server'

export function adminAuthMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing admin routes
  if (pathname.startsWith('/backend/admin')) {
    // Add security headers for admin panel
    const response = NextResponse.next()
    
    // Prevent iframe embedding (clickjacking protection)
    response.headers.set('X-Frame-Options', 'DENY')
    
    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    // XSS protection
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Content Security Policy for admin panel
    response.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self';"
    )
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/backend/admin/:path*'
}
