'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { setAuthCookie, clearAuthCookie } from '@/utils/auth'

interface User {
  id: string
  email: string
  name: string
  avatar: string
  joinedAt: string
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    notifications: boolean
    analytics: boolean
    defaultTimerDuration: number
    autoSaveFrequency: number
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('student_tools_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setAuthCookie(true)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('student_tools_user')
      }
    }
    
    // Create demo user if no users exist
    const registeredUsers = JSON.parse(localStorage.getItem('student_tools_registered_users') || '[]')
    if (registeredUsers.length === 0) {
      const demoUser = {
        id: 'demo-user-123',
        name: 'Demo Student',
        email: 'demo@student.com',
        password: 'demo123',
        avatar: 'https://ui-avatars.com/api/?name=Demo+Student&background=3B82F6&color=fff',
        joinedAt: new Date().toISOString(),
        preferences: {
          theme: 'light',
          notifications: true,
          analytics: false,
          defaultTimerDuration: 25,
          autoSaveFrequency: 30
        }
      }
      localStorage.setItem('student_tools_registered_users', JSON.stringify([demoUser]))
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get registered users from localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('student_tools_registered_users') || '[]')
      
      // Check if user exists and password matches
      const user = registeredUsers.find((u: any) => 
        u.email === email && u.password === password
      )
      
      if (user) {
        // Remove password from user object before storing in session
        const { password: _, ...userWithoutPassword } = user
        
        setUser(userWithoutPassword)
        localStorage.setItem('student_tools_user', JSON.stringify(userWithoutPassword))
        setAuthCookie(true)
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Get existing registered users
      const registeredUsers = JSON.parse(localStorage.getItem('student_tools_registered_users') || '[]')
      
      // Check if user already exists
      const existingUser = registeredUsers.find((u: any) => u.email === email)
      if (existingUser) {
        setIsLoading(false)
        return false // User already exists
      }
      
      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name,
        email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff`,
        joinedAt: new Date().toISOString(),
        preferences: {
          theme: 'light',
          notifications: true,
          analytics: false,
          defaultTimerDuration: 25,
          autoSaveFrequency: 30
        }
      }
      
      // Store user with password in registered users (for login validation)
      const userWithPassword = { ...newUser, password }
      registeredUsers.push(userWithPassword)
      localStorage.setItem('student_tools_registered_users', JSON.stringify(registeredUsers))
      
      // Set current user (without password)
      setUser(newUser)
      localStorage.setItem('student_tools_user', JSON.stringify(newUser))
      setAuthCookie(true)
      setIsLoading(false)
      
      return true
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('student_tools_user')
    clearAuthCookie()
  }

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem('student_tools_user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}