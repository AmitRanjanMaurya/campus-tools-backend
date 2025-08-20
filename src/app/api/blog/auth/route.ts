import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Store credentials securely in environment variables
const ADMIN_EMAIL = process.env.BLOG_ADMIN_EMAIL || 'amitranjanmaurya10@gmail.com'
const ADMIN_PASSWORD = process.env.BLOG_ADMIN_PASSWORD || 'Ranjan@2003@annu'
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// In-memory rate limiting (in production, use Redis or database)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

interface LoginRequest {
  email: string
  password: string
}

// Simple JWT-like token generation (in production, use proper JWT library)
function generateSecureToken(email: string): string {
  const timestamp = Date.now()
  const data = `${email}:${timestamp}`
  const hash = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex')
  return Buffer.from(`${data}:${hash}`).toString('base64')
}

function verifySecureToken(token: string): { email: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const [email, timestampStr, hash] = decoded.split(':')
    const timestamp = parseInt(timestampStr)
    
    // Verify hash
    const expectedHash = crypto.createHmac('sha256', JWT_SECRET).update(`${email}:${timestamp}`).digest('hex')
    if (hash !== expectedHash) return null
    
    // Check if token is still valid (24 hours)
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return null
    
    return { email, timestamp }
  } catch {
    return null
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remainingTime?: number } {
  const attempts = loginAttempts.get(ip)
  if (!attempts) return { allowed: true }
  
  const timeSinceLastAttempt = Date.now() - attempts.lastAttempt
  
  if (attempts.count >= MAX_ATTEMPTS && timeSinceLastAttempt < LOCKOUT_DURATION) {
    return { 
      allowed: false, 
      remainingTime: LOCKOUT_DURATION - timeSinceLastAttempt 
    }
  }
  
  // Reset attempts if lockout period has passed
  if (timeSinceLastAttempt >= LOCKOUT_DURATION) {
    loginAttempts.delete(ip)
    return { allowed: true }
  }
  
  return { allowed: true }
}

function recordFailedAttempt(ip: string) {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 }
  loginAttempts.set(ip, {
    count: attempts.count + 1,
    lastAttempt: Date.now()
  })
}

function clearFailedAttempts(ip: string) {
  loginAttempts.delete(ip)
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    
    // Check rate limiting
    const rateLimit = checkRateLimit(clientIP)
    if (!rateLimit.allowed) {
      const minutes = Math.ceil((rateLimit.remainingTime || 0) / (60 * 1000))
      return NextResponse.json(
        { 
          error: 'Too many failed attempts', 
          message: `Please wait ${minutes} minutes before trying again.`,
          remainingTime: rateLimit.remainingTime
        },
        { status: 429 }
      )
    }

    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Simulate processing time to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Success - clear failed attempts
      clearFailedAttempts(clientIP)
      
      // Generate secure token
      const token = generateSecureToken(email)
      
      // Return user data (without sensitive info)
      const user = {
        id: '1',
        email: ADMIN_EMAIL,
        name: 'Blog Administrator',
        role: 'admin'
      }

      return NextResponse.json({
        success: true,
        user,
        token,
        message: 'Login successful'
      })
    } else {
      // Failed login - record attempt
      recordFailedAttempt(clientIP)
      
      return NextResponse.json(
        { 
          error: 'Invalid credentials',
          message: 'Invalid email or password. Access restricted to authorized personnel only.'
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Blog auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Verify token endpoint
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const tokenData = verifySecureToken(token)
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Return user data
    const user = {
      id: '1',
      email: tokenData.email,
      name: 'Blog Administrator',
      role: 'admin'
    }

    return NextResponse.json({
      valid: true,
      user
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    )
  }
}
