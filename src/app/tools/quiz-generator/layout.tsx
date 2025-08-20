import { generateToolMetadata } from '@/utils/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateToolMetadata({
  toolName: 'Quiz Generator',
  description: 'Create custom quizzes and tests instantly with AI. Generate questions from any topic for effective study and assessment.',
  keywords: ['quiz generator', 'test maker', 'AI quiz', 'study quiz', 'custom quiz'],
  category: 'study'
})

export default function QuizGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
