'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { 
  Mail, 
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader,
  Lock,
  Eye,
  EyeOff,
  Key
} from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'verification' | 'newPassword' | 'success'>('email')
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!formData.email.trim()) {
      setError('Email is required')
      setIsLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      // Simulate sending reset email
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, always succeed
      setStep('verification')
      setResendTimer(60) // 60 seconds countdown
      
      // Start countdown timer
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!formData.verificationCode.trim()) {
      setError('Verification code is required')
      setIsLoading(false)
      return
    }

    if (formData.verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code')
      setIsLoading(false)
      return
    }

    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo purposes, accept any 6-digit code
      if (formData.verificationCode.match(/^\d{6}$/)) {
        setStep('newPassword')
      } else {
        setError('Invalid verification code. Please check and try again.')
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!formData.newPassword.trim()) {
      setError('New password is required')
      setIsLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      // Simulate password reset
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, always succeed
      setStep('success')
    } catch (err) {
      setError('Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setIsLoading(true)

    try {
      // Simulate resending code
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setResendTimer(60)
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (err) {
      setError('Failed to resend code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderEmailStep = () => (
    <>
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center">
          <Mail className="w-5 h-5 mr-2 text-blue-600" />
          Reset Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Enter your email address and we'll send you a verification code to reset your password.
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Sending Code...
              </>
            ) : (
              'Send Verification Code'
            )}
          </Button>
        </form>

        <div className="text-center mt-6">
          <Link 
            href="/login" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </>
  )

  const renderVerificationStep = () => (
    <>
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center">
          <Key className="w-5 h-5 mr-2 text-blue-600" />
          Verify Your Email
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">
            We've sent a 6-digit verification code to:
          </p>
          <p className="font-medium text-gray-900">{formData.email}</p>
          <p className="text-sm text-gray-500 mt-2">
            Please check your email and enter the code below.
          </p>
        </div>

        <form onSubmit={handleVerificationSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              name="verificationCode"
              value={formData.verificationCode}
              onChange={handleInputChange}
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
              autoComplete="one-time-code"
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            {resendTimer > 0 ? (
              <span className="text-gray-500">
                Resend in {resendTimer}s
              </span>
            ) : (
              <button 
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend Code
              </button>
            )}
          </p>
        </div>

        <div className="text-center mt-4">
          <button 
            onClick={() => setStep('email')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Use Different Email
          </button>
        </div>
      </CardContent>
    </>
  )

  const renderNewPasswordStep = () => (
    <>
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center">
          <Lock className="w-5 h-5 mr-2 text-blue-600" />
          Set New Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Create a strong new password for your account.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter new password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Confirm new password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </CardContent>
    </>
  )

  const renderSuccessStep = () => (
    <>
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          Password Reset Complete
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Password Successfully Reset
            </h3>
            <p className="text-gray-600">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
          </div>

          <Button 
            onClick={() => router.push('/login')}
            className="w-full"
          >
            Sign In Now
          </Button>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
            <strong>Security Tip:</strong> Make sure to keep your new password secure and don't share it with anyone.
          </div>
        </div>
      </CardContent>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link 
              href="/login" 
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset</h1>
          <p className="text-gray-600">Secure your account with a new password</p>
        </div>

        {/* Reset Form Card */}
        <Card>
          {step === 'email' && renderEmailStep()}
          {step === 'verification' && renderVerificationStep()}
          {step === 'newPassword' && renderNewPasswordStep()}
          {step === 'success' && renderSuccessStep()}
        </Card>

        {/* Demo Notice */}
        {step !== 'success' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Demo Mode:</strong> 
                {step === 'email' && ' Any email will work.'}
                {step === 'verification' && ' Use any 6-digit code (e.g., 123456).'}
                {step === 'newPassword' && ' Set any password you like.'}
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-1" />
            <span>Secure password reset process</span>
          </div>
        </div>
      </div>
    </div>
  )
}
