'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useRouter } from 'next/navigation'
import { Loader, LogOut } from 'lucide-react'

export default function LogoutPage() {
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear user session
        logout()
        
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Redirect to home page
        router.push('/')
      } catch (error) {
        console.error('Logout error:', error)
        router.push('/')
      }
    }

    handleLogout()
  }, [logout, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Signing Out...</h1>
        <p className="text-gray-600 mb-6">Please wait while we securely log you out.</p>
        <Loader className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
      </div>
    </div>
  )
}
