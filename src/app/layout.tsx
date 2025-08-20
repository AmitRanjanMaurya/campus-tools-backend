import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/FirebaseAuthContext'
import Header from '@/components/Header'
import Analytics from '@/components/Analytics'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://campustoolshub.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'CampusToolsHub - Ultimate Productivity Hub for College Students',
    template: '%s | CampusToolsHub'
  },
  description: 'Comprehensive web-based productivity platform for students featuring GPA calculator, resume builder, study timer, flashcards, notes organizer, AI tools, and 20+ academic utilities.',
  keywords: [
    'student tools',
    'academic productivity',
    'GPA calculator',
    'resume builder', 
    'study timer',
    'flashcards',
    'notes organizer',
    'AI study guide',
    'plagiarism checker',
    'citation generator',
    'student dashboard',
    'academic planner',
    'timetable maker',
    'unit converter',
    'scientific calculator',
    'mind map generator',
    'quiz generator',
    'study tools',
    'educational resources',
    'student productivity suite'
  ],
  authors: [{ name: 'StudentTools Team' }],
  creator: 'StudentTools',
  publisher: 'StudentTools',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'StudentTools - All-in-One Academic Productivity Platform',
    description: 'Boost your academic performance with 20+ productivity tools including GPA calculator, resume builder, AI study guides, and more.',
    siteName: 'CampusToolsHub',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StudentTools - Academic Productivity Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudentTools - All-in-One Academic Productivity Platform',
    description: 'Boost your academic performance with 20+ productivity tools including GPA calculator, resume builder, AI study guides, and more.',
    images: ['/og-image.png'],
    creator: '@studenttools',
  },
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: baseUrl,
  },
  category: 'education',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "StudentTools",
    "url": baseUrl,
    "description": "Comprehensive academic productivity platform with 20+ tools for students",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "StudentTools"
    },
    "featureList": [
      "GPA Calculator",
      "Resume Builder", 
      "Study Timer",
      "Flashcards Creator",
      "Notes Organizer",
      "AI Study Guide",
      "Plagiarism Checker",
      "Citation Generator",
      "Timetable Maker",
      "Unit Converter",
      "Scientific Calculator",
      "Mind Map Generator",
      "Quiz Generator"
    ]
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StudentTools" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body 
        className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 antialiased"
        suppressHydrationWarning={true}
      >
        <div id="app-container" suppressHydrationWarning={true}>
          <Analytics />
          <AuthProvider>
            <Header />
            <main className="relative">
              {children}
            </main>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}
