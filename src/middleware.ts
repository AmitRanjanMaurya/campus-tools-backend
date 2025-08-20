import { NextRequest, NextResponse } from 'next/server';

// Security headers for all responses
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY', 
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}

// Rate limiting storage (use Redis in production)
const rateLimitMap = new Map()

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  const userAgent = request.headers.get('user-agent') || ''
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   request.ip || 
                   'unknown'

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Block known malicious bots and crawlers
  const maliciousBots = [
    'AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot', 'BLEXBot',
    'serpstatbot', 'linkdexbot', 'spbot', 'gigabot', 'scrapy'
  ]
  
  if (maliciousBots.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()))) {
    return new NextResponse('Access Denied', { status: 403 })
  }

  // Block common vulnerability scan attempts
  const suspiciousPatterns = [
    '/wp-admin', '/wp-content', '/xmlrpc.php', '/.git', '/phpmyadmin',
    '/admin.php', '/login.php', '/config.php', '/database/', '/backup/',
    '.env', 'package.json', 'yarn.lock', '.DS_Store', '/node_modules'
  ]

  if (suspiciousPatterns.some(pattern => pathname.includes(pattern))) {
    console.warn(`Blocked suspicious request from ${clientIP}: ${pathname}`)
    return new NextResponse('Not Found', { status: 404 })
  }

  // Protect sensitive API routes
  if (pathname.startsWith('/api/blog/auth')) {
    if (isRateLimited(clientIP, 'auth')) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '900', // 15 minutes
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0'
        }
      })
    }
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    if (isRateLimited(clientIP, 'api')) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0'
        }
      })
    }
  }

  // Define protected routes that require authentication (excluding blog admin)
  const protectedRoutes = [
    '/dashboard',
    '/account',
    '/profile'
  ];

  // Define auth routes that should redirect authenticated users
  const authRoutes = ['/login', '/signup', '/reset-password'];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Get authentication status from cookie (since we can't access localStorage in middleware)
  const authCookie = request.cookies.get('student_tools_auth')?.value;
  const isAuthenticated = authCookie === 'true';

  // Handle protected routes (excluding blog admin which has its own auth system)
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Blog admin route has its own authentication system - let it handle auth internally
  if (pathname.startsWith('/admin/blog')) {
    // Don't redirect, let the blog admin page handle its own authentication
    // The BlogAuth system will show the AdminLogin component if not authenticated
    return response;
  }

  // Handle auth routes - redirect authenticated users to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Enhanced security for admin panel
  if (pathname.startsWith('/backend/admin') || pathname.startsWith('/admin/blog')) {
    // Extra strict security headers for admin panel
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self';"
    );
    
    // Hide server information
    response.headers.set('Server', '');
    response.headers.set('X-Powered-By', '');
  }

  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}${request.nextUrl.search}`
    )
  }
  
  return response;
}

// Simple rate limiting function (use Redis in production)
function isRateLimited(clientIP: string, type: 'api' | 'auth'): boolean {
  const now = Date.now()
  const key = `${clientIP}:${type}`
  const limit = type === 'auth' ? 5 : 100 // 5 auth attempts, 100 API calls
  const window = type === 'auth' ? 15 * 60 * 1000 : 60 * 1000 // 15 min for auth, 1 min for API

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + window })
    return false
  }

  const record = rateLimitMap.get(key)
  
  if (now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + window })
    return false
  }

  if (record.count >= limit) {
    return true
  }

  record.count++
  return false
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (SEO files)
     * - manifest.json (PWA manifest)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|icon|apple-touch-icon).*)',
  ],
};
