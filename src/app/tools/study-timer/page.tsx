'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, Square, RotateCcw, Settings } from 'lucide-react'

const StudyTimer = () => {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [workDuration, setWorkDuration] = useState(25)
  const [shortBreakDuration, setShortBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [showSettings, setShowSettings] = useState(false)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3') // You'd need to add this file
    }
  }, [])

  const playNotification = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Audio play failed, show visual notification instead
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(isBreak ? 'Break time is over!' : 'Work session completed!')
        }
      })
    }
  }, [isBreak])

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1)
        } else if (minutes > 0) {
          setMinutes(minutes - 1)
          setSeconds(59)
        } else {
          // Timer finished
          setIsActive(false)
          playNotification()
          
          if (isBreak) {
            // Break finished, start work session
            setIsBreak(false)
            setMinutes(workDuration)
            setSeconds(0)
          } else {
            // Work session finished
            const newSessionsCompleted = sessionsCompleted + 1
            setSessionsCompleted(newSessionsCompleted)
            setIsBreak(true)
            
            // Long break every 4 sessions, short break otherwise
            const breakDuration = newSessionsCompleted % 4 === 0 ? longBreakDuration : shortBreakDuration
            setMinutes(breakDuration)
            setSeconds(0)
          }
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, minutes, seconds, isBreak, sessionsCompleted, workDuration, shortBreakDuration, longBreakDuration, playNotification])

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
    if (!isActive) {
      requestNotificationPermission()
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setIsBreak(false)
    setMinutes(workDuration)
    setSeconds(0)
  }

  const stopTimer = () => {
    setIsActive(false)
    setIsBreak(false)
    setMinutes(workDuration)
    setSeconds(0)
    setSessionsCompleted(0)
  }

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const totalDuration = isBreak 
      ? (sessionsCompleted % 4 === 0 ? longBreakDuration : shortBreakDuration)
      : workDuration
    const currentTime = minutes * 60 + seconds
    const totalTime = totalDuration * 60
    return ((totalTime - currentTime) / totalTime) * 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/tools" className="flex items-center text-secondary-600 hover:text-primary-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tools
          </Link>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Study Timer
          </h1>
          <p className="text-lg text-secondary-600">
            Boost your productivity with the Pomodoro Technique
          </p>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={workDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    setWorkDuration(value)
                    if (!isActive && !isBreak) {
                      setMinutes(value)
                      setSeconds(0)
                    }
                  }}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={shortBreakDuration}
                  onChange={(e) => setShortBreakDuration(parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  min="10"
                  max="30"
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="card text-center mb-8">
          <div className="mb-6">
            <div className={`text-6xl md:text-8xl font-bold mb-4 ${
              isBreak ? 'text-green-600' : 'text-primary-600'
            }`}>
              {formatTime(minutes, seconds)}
            </div>
            <div className="text-xl text-secondary-600 mb-4">
              {isBreak ? '☕ Break Time' : '📚 Work Session'}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-secondary-200 rounded-full h-2 mb-6">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  isBreak ? 'bg-green-500' : 'bg-primary-500'
                }`}
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={toggleTimer}
              className={`btn-primary flex items-center px-6 py-3 text-lg ${
                isActive ? 'bg-orange-600 hover:bg-orange-700' : ''
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </>
              )}
            </button>
            
            <button
              onClick={resetTimer}
              className="btn-secondary flex items-center px-6 py-3 text-lg"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </button>
            
            <button
              onClick={stopTimer}
              className="btn-secondary flex items-center px-6 py-3 text-lg text-red-600 hover:bg-red-50"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop
            </button>
          </div>

          {/* Session Counter */}
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-900 mb-2">
              {sessionsCompleted}
            </div>
            <div className="text-secondary-600">Sessions Completed</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">How it Works</h3>
          <div className="space-y-3 text-secondary-600">
            <p>The Pomodoro Technique is a time management method that uses focused work sessions followed by short breaks:</p>
            <ul className="space-y-2 ml-4">
              <li>• Work for 25 minutes (default) with full focus</li>
              <li>• Take a 5-minute short break</li>
              <li>• After 4 work sessions, take a longer 15-minute break</li>
              <li>• Repeat the cycle to maintain productivity</li>
            </ul>
            <p className="text-sm mt-4">
              💡 Tip: During work sessions, avoid distractions like social media or unnecessary notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudyTimer
