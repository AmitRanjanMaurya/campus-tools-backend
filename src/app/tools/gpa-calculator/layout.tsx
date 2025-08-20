import { generateToolMetadata, generateToolStructuredData } from '@/utils/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateToolMetadata({
  toolName: 'GPA Calculator',
  description: 'Calculate your Grade Point Average quickly and accurately. Track semester and cumulative GPA with letter grades.',
  keywords: ['GPA calculator', 'grade point average', 'GPA tracker', 'college GPA', 'semester GPA'],
  category: 'academic'
})

export default function GPACalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = generateToolStructuredData(
    'GPA Calculator',
    'Calculate your Grade Point Average quickly and accurately. Track semester and cumulative GPA with letter grades.',
    'academic'
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  )
}
