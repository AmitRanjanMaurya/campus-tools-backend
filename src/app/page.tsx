import Hero from '@/components/home/Hero'
import ToolsGrid from '@/components/home/ToolsGrid'
import Features from '@/components/home/Features'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CampusToolsHub - Ultimate Productivity Hub for College Students',
  description: 'Access 20+ free academic tools including GPA calculator, resume builder, AI study guides, plagiarism checker, flashcards, and more. Boost your academic performance today!',
  keywords: [
    'free student tools',
    'academic productivity',
    'student dashboard',
    'GPA calculator free',
    'resume builder student',
    'AI study guide',
    'flashcards online',
    'plagiarism checker free',
    'citation generator',
    'study timer',
    'notes organizer',
    'academic planner',
    'student resources',
    'educational tools',
    'homework helper'
  ],
  openGraph: {
    title: 'StudentTools - Free Academic Productivity Platform',
    description: 'Access 20+ free academic tools to boost your academic performance. GPA calculator, resume builder, AI study guides, and more!',
    url: '/',
    images: [
      {
        url: '/og-image-home.png',
        width: 1200,
        height: 630,
        alt: 'StudentTools Homepage - Free Academic Tools',
      },
    ],
  },
  twitter: {
    title: 'StudentTools - Free Academic Productivity Platform',
    description: 'Access 20+ free academic tools to boost your academic performance. GPA calculator, resume builder, AI study guides, and more!',
    images: ['/og-image-home.png'],
  },
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ToolsGrid />
      <Features />
      <Footer />
    </main>
  )
}
