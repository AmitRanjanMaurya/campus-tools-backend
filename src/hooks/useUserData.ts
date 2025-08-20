'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/FirebaseAuthContext'

export function useUserData<T>(key: string, initialValue: T) {
  const { user } = useAuth()
  const [data, setData] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  // Create user-specific storage key
  const storageKey = user ? `student_tools_${user.id}_${key}` : `student_tools_guest_${key}`

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
        setData(JSON.parse(savedData))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [storageKey])

  const saveData = (newData: T) => {
    try {
      setData(newData)
      localStorage.setItem(storageKey, JSON.stringify(newData))
    } catch (error) {
      console.error('Error saving user data:', error)
    }
  }

  const clearData = () => {
    try {
      setData(initialValue)
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing user data:', error)
    }
  }

  return {
    data,
    saveData,
    clearData,
    isLoading,
    isAuthenticated: !!user
  }
}

// Specific hooks for different data types
interface GradeTrackerData {
  courses: any[]
  grades: any[]
}

export function useGradeTrackerData() {
  return useUserData<GradeTrackerData>('grade_tracker', {
    courses: [],
    grades: []
  })
}

export function useGPACalculatorData() {
  return useUserData('gpa_calculator', {
    subjects: [],
    gradingSystem: 'percentage'
  })
}

export function useStudyTimerData() {
  return useUserData('study_timer', {
    totalStudyTime: 0,
    sessionsCompleted: 0,
    currentStreak: 0,
    lastStudyDate: null
  })
}

export function useNotesData() {
  return useUserData('notes', {
    notes: [],
    categories: ['General', 'Study', 'Personal']
  })
}

export function useFlashcardsData() {
  return useUserData('flashcards', {
    decks: [],
    studySessions: []
  })
}
