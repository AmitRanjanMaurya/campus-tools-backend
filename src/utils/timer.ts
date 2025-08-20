// Timer utilities for the study timer
export interface TimerState {
  minutes: number
  seconds: number
  isActive: boolean
  isBreak: boolean
  sessionsCompleted: number
}

export interface TimerSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
}

export const formatTime = (minutes: number, seconds: number): string => {
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const calculateProgress = (
  currentMinutes: number,
  currentSeconds: number,
  totalMinutes: number
): number => {
  const currentTime = currentMinutes * 60 + currentSeconds
  const totalTime = totalMinutes * 60
  return ((totalTime - currentTime) / totalTime) * 100
}

export const getNextTimerState = (
  currentState: TimerState,
  settings: TimerSettings
): Partial<TimerState> => {
  if (currentState.isBreak) {
    // Break finished, start work session
    return {
      isBreak: false,
      minutes: settings.workDuration,
      seconds: 0
    }
  } else {
    // Work session finished
    const newSessionsCompleted = currentState.sessionsCompleted + 1
    const isLongBreak = newSessionsCompleted % 4 === 0
    const breakDuration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration
    
    return {
      isBreak: true,
      minutes: breakDuration,
      seconds: 0,
      sessionsCompleted: newSessionsCompleted
    }
  }
}

export const playNotificationSound = async (): Promise<void> => {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.warn('Audio notification failed:', error)
  }
}

export const requestNotificationPermission = async (): Promise<void> => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

export const showNotification = (message: string): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Study Timer', {
      body: message,
      icon: '/favicon.ico'
    })
  }
}
