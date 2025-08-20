import { generateToolMetadata } from '@/utils/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateToolMetadata({
  toolName: 'Study Timer',
  description: 'Boost productivity with our Pomodoro study timer. Focus sessions, break reminders, and time tracking for better study habits.',
  keywords: ['study timer', 'pomodoro timer', 'focus timer', 'productivity timer', 'study sessions'],
  category: 'productivity'
})

export default function StudyTimerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
