/**
 * Secure Environment Configuration
 * This file provides safe access to environment variables
 * NEVER expose sensitive data to the frontend
 */

// ✅ SAFE - Public environment variables (can be exposed to frontend)
export const publicConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://campustoolshub.com',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'CampusToolsHub',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@campustoolshub.com',
  gaTrackingId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  
  // Firebase public config (safe to expose)
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  }
}

// ❌ PRIVATE - Server-side only (NEVER expose to frontend)
export const serverConfig = {
  // Database & Authentication
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  
  // Blog Admin Credentials
  blogAdminEmail: process.env.BLOG_ADMIN_EMAIL,
  blogAdminPassword: process.env.BLOG_ADMIN_PASSWORD,
  
  // API Keys
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  googleApiKey: process.env.GOOGLE_API_KEY,
  
  // Firebase Admin (private key)
  firebaseAdminPrivateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  
  // Email Service
  emailApiKey: process.env.EMAIL_API_KEY,
  emailFrom: process.env.EMAIL_FROM
}

// Validation function to ensure required environment variables are set
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SITE_URL',
    'JWT_SECRET',
    'BLOG_ADMIN_EMAIL',
    'BLOG_ADMIN_PASSWORD'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`)
    // Don't throw in production build, just warn
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }
}

// Secure header configuration for API responses
export const secureHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
}

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
}
