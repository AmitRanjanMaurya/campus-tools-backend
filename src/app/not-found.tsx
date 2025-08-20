'use client'

import React from 'react'
import Link from 'next/link'
import { Home, Search, ArrowLeft, HelpCircle, RotateCcw } from 'lucide-react'

export default function NotFoundPage() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-600 mb-4">404</div>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-secondary-600 mb-8">
            The page you're looking for seems to have taken a study break. 
            Don't worry, it happens to the best of us!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link href="/" className="btn-primary flex items-center justify-center">
            <Home className="h-5 w-5 mr-2" />
            Go Home
          </Link>
          
          <button 
            onClick={handleGoBack}
            className="btn-secondary flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Popular Links */}
        <div className="card">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">
            Popular Student Tools
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <Link 
              href="/tools/gpa-calculator" 
              className="p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-left"
            >
              <h3 className="font-medium text-secondary-900">GPA Calculator</h3>
              <p className="text-sm text-secondary-600">Calculate your grade point average</p>
            </Link>
            
            <Link 
              href="/tools/study-timer" 
              className="p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-left"
            >
              <h3 className="font-medium text-secondary-900">Study Timer</h3>
              <p className="text-sm text-secondary-600">Pomodoro technique for focused study</p>
            </Link>
            
            <Link 
              href="/tools/resume-builder" 
              className="p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-left"
            >
              <h3 className="font-medium text-secondary-900">Resume Builder</h3>
              <p className="text-sm text-secondary-600">Create professional resumes</p>
            </Link>
            
            <Link 
              href="/tools/flashcards" 
              className="p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-left"
            >
              <h3 className="font-medium text-secondary-900">Flashcards</h3>
              <p className="text-sm text-secondary-600">Digital flashcard creator</p>
            </Link>
          </div>
        </div>

        {/* Search Box */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Looking for something specific?
          </h3>
          
          <form action="/search" method="GET" className="flex gap-3">
            <input
              type="text"
              name="q"
              placeholder="Search for tools, guides, or resources..."
              className="flex-1 px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button 
              type="submit"
              className="btn-primary flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
          </form>
        </div>

        {/* Help Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/tools" className="text-primary-600 hover:text-primary-700 flex items-center">
            <HelpCircle className="h-4 w-4 mr-1" />
            Browse All Tools
          </Link>
          
          <Link href="/blog" className="text-primary-600 hover:text-primary-700 flex items-center">
            <HelpCircle className="h-4 w-4 mr-1" />
            Read Blog Posts
          </Link>
          
          <Link href="/contact" className="text-primary-600 hover:text-primary-700 flex items-center">
            <HelpCircle className="h-4 w-4 mr-1" />
            Contact Support
          </Link>
          
          <Link href="/faq" className="text-primary-600 hover:text-primary-700 flex items-center">
            <HelpCircle className="h-4 w-4 mr-1" />
            View FAQs
          </Link>
        </div>

        {/* Fun Message */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">
            💡 <strong>Study Tip:</strong> Just like finding the right page, effective studying requires the right tools. 
            Check out our study resources to boost your academic performance!
          </p>
        </div>
      </div>
    </div>
  )
}
