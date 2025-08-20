import { generateToolMetadata } from '@/utils/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateToolMetadata({
  toolName: 'Resume Builder',
  description: 'Create professional resumes with our free online resume builder. Multiple templates, ATS-friendly formats, and instant download.',
  keywords: ['resume builder', 'CV maker', 'resume template', 'ATS resume', 'professional resume'],
  category: 'career'
})

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
