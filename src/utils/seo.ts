import type { Metadata } from 'next'

interface ToolSEOProps {
  toolName: string
  description: string
  keywords: string[]
  category?: string
}

export function generateToolMetadata({
  toolName,
  description,
  keywords,
  category = 'productivity'
}: ToolSEOProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://campustoolshub.com'
  // Generate dynamic OG image URL
  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(toolName)}&description=${encodeURIComponent(description)}`
  const slug = toolName.toLowerCase().replace(/\s+/g, '-')

  const defaultKeywords = [
    'campus tools',
    'college tools',
    'student productivity tools',
    'university tools',
    'engineering tools',
    'academic productivity',
    'free student tools',
    'college productivity',
    'study tools for students',
    'campus productivity hub'
  ]

  const allKeywords = [...defaultKeywords, ...keywords, toolName]

  return {
    title: `${toolName} - Free Tool for College Students | CampusToolsHub`,
    description: `${description} Use our free ${toolName.toLowerCase()} designed specifically for college students. No registration required.`,
    keywords: allKeywords.join(', '),
    openGraph: {
      title: `${toolName} - Free Campus Tool | CampusToolsHub`,
      description,
      url: `${baseUrl}/tools/${slug}`,
      siteName: 'CampusToolsHub',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${toolName} - ${description}`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${toolName} - Free Campus Tool | CampusToolsHub`,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'tool-category': category,
    },
  }
}

export function generateToolStructuredData(toolName: string, description: string, category: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://campustoolshub.com'
  const slug = toolName.toLowerCase().replace(/\s+/g, '-')

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": toolName,
    "description": description,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Any",
    "permissions": "browser",
    "isAccessibleForFree": true,
    "author": {
      "@type": "Organization",
      "name": "CampusToolsHub",
      "url": "https://campustoolshub.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CampusToolsHub",
      "url": "https://campustoolshub.com"
    },
    "url": `${baseUrl}/tools/${slug}`,
    "potentialAction": {
      "@type": "UseAction",
      "target": `${baseUrl}/tools/${slug}`
    },
    "category": category,
    "keywords": [toolName, description.split(' ').slice(0, 3).join(' ')],
    "inLanguage": "en",
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student"
    }
  }
}

// Enhanced tool categories for better SEO targeting
export const TOOL_CATEGORIES = {
  academic: {
    tools: ['GPA Calculator', 'Grade Tracker', 'Citation Generator'],
    primaryKeywords: ['gpa calculator', 'grade tracker', 'citation tool'],
    audience: 'College students tracking academic performance'
  },
  productivity: {
    tools: ['Study Timer', 'Deadline Tracker', 'Notes', 'Timetable'],
    primaryKeywords: ['study timer', 'pomodoro timer', 'college schedule'],
    audience: 'Students improving study productivity'
  },
  career: {
    tools: ['Resume Builder', 'Resume Analyzer', 'Internship Finder'],
    primaryKeywords: ['resume builder students', 'college resume template'],
    audience: 'Students preparing for career opportunities'
  },
  study: {
    tools: ['Quiz Generator', 'Flashcards', 'AI Study Guide'],
    primaryKeywords: ['ai flashcards', 'quiz generator', 'study guide maker'],
    audience: 'Students creating effective study materials'
  },
  finance: {
    tools: ['Budget Planner'],
    primaryKeywords: ['student budget calculator', 'college budget planner'],
    audience: 'Students managing college finances'
  },
  technical: {
    tools: ['Code Playground', 'Unit Converter', 'Scientific Calculator'],
    primaryKeywords: ['engineering calculator', 'unit converter engineering'],
    audience: 'Engineering and STEM students'
  },
  creative: {
    tools: ['Mind Map', 'Whiteboard'],
    primaryKeywords: ['mind map maker', 'online whiteboard students'],
    audience: 'Students organizing ideas visually'
  },
  research: {
    tools: ['Plagiarism Checker', 'Lab Report Generator'],
    primaryKeywords: ['plagiarism checker students', 'lab report template'],
    audience: 'Students conducting academic research'
  }
}

export function getCategoryForTool(toolName: string): string {
  for (const [category, data] of Object.entries(TOOL_CATEGORIES)) {
    if (data.tools.some(tool => tool.toLowerCase() === toolName.toLowerCase())) {
      return category
    }
  }
  return 'productivity'
}

// SEO-optimized keyword mapping for each tool
export const TOOL_KEYWORD_MAP = {
  'gpa-calculator': {
    primary: 'gpa calculator',
    secondary: ['college gpa calculator', 'semester gpa calculator', 'cgpa calculator'],
    longTail: ['how to calculate gpa in college', 'free gpa calculator for students']
  },
  'resume-builder': {
    primary: 'resume builder for students',
    secondary: ['college resume template', 'student resume maker', 'free resume builder'],
    longTail: ['how to make resume for college students', 'ats friendly resume builder']
  },
  'study-timer': {
    primary: 'study timer',
    secondary: ['pomodoro timer students', 'focus timer', 'study session timer'],
    longTail: ['best study timer for college students', 'pomodoro technique for studying']
  },
  'flashcards': {
    primary: 'ai flashcards',
    secondary: ['online flashcard maker', 'digital flashcards', 'study flashcards'],
    longTail: ['ai generated flashcards', 'best flashcard app for students']
  },
  'quiz-generator': {
    primary: 'quiz generator',
    secondary: ['ai quiz maker', 'online quiz creator', 'study quiz generator'],
    longTail: ['generate quiz from text', 'ai quiz generator for students']
  },
  'plagiarism-checker': {
    primary: 'plagiarism checker',
    secondary: ['free plagiarism detector', 'plagiarism scanner students'],
    longTail: ['best plagiarism checker for students', 'free plagiarism check online']
  }
}
