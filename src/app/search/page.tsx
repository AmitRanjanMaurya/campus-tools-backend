'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Search, Filter, Clock, FileText, Calculator, BookOpen, PenTool, Target, ChevronRight } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'tool' | 'blog' | 'note' | 'formula'
  url: string
  category?: string
  tags?: string[]
  lastUpdated?: string
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const query = searchParams?.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('relevance')

  // Mock search results - in real app, this would be an API call
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'GPA Calculator',
      description: 'Calculate your Grade Point Average with support for different grading systems including 4.0 and 10-point scales.',
      type: 'tool',
      url: '/tools/gpa-calculator',
      category: 'Academic',
      tags: ['gpa', 'grades', 'calculator'],
      lastUpdated: '2025-08-01'
    },
    {
      id: '2',
      title: 'Study Timer (Pomodoro)',
      description: 'Boost your productivity with the Pomodoro Technique. Set focused study sessions with automated breaks.',
      type: 'tool',
      url: '/tools/study-timer',
      category: 'Productivity',
      tags: ['timer', 'pomodoro', 'focus'],
      lastUpdated: '2025-07-28'
    },
    {
      id: '3',
      title: 'How to Calculate GPA: A Complete Guide',
      description: 'Learn everything about GPA calculation, different grading systems, and tips to improve your academic performance.',
      type: 'blog',
      url: '/blog/how-to-calculate-gpa',
      category: 'Academic Tips',
      tags: ['gpa', 'academic', 'guide'],
      lastUpdated: '2025-07-25'
    },
    {
      id: '4',
      title: 'Resume Builder',
      description: 'Create professional resumes with our easy-to-use builder. Multiple templates and PDF export available.',
      type: 'tool',
      url: '/tools/resume-builder',
      category: 'Career',
      tags: ['resume', 'cv', 'career'],
      lastUpdated: '2025-08-02'
    },
    {
      id: '5',
      title: 'Flashcard Creator',
      description: 'Create, organize, and study with digital flashcards. Perfect for memorizing terms, formulas, and concepts.',
      type: 'tool',
      url: '/tools/flashcards',
      category: 'Study Tools',
      tags: ['flashcards', 'memory', 'study'],
      lastUpdated: '2025-07-30'
    },
    {
      id: '6',
      title: 'Quadratic Formula',
      description: 'x = (-b ± √(b² - 4ac)) / (2a) - Solve quadratic equations with this fundamental mathematical formula.',
      type: 'formula',
      url: '/tools/formula-repository?search=quadratic',
      category: 'Mathematics',
      tags: ['math', 'algebra', 'quadratic'],
      lastUpdated: '2025-07-20'
    }
  ]

  useEffect(() => {
    performSearch()
  }, [query, filter, sortBy])

  const performSearch = () => {
    setLoading(true)
    
    // Simulate API delay
    setTimeout(() => {
      let filteredResults = mockResults.filter(result => {
        const matchesQuery = query.toLowerCase() === '' || 
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))

        const matchesFilter = filter === 'all' || result.type === filter

        return matchesQuery && matchesFilter
      })

      // Sort results
      if (sortBy === 'date') {
        filteredResults.sort((a, b) => new Date(b.lastUpdated || '').getTime() - new Date(a.lastUpdated || '').getTime())
      } else if (sortBy === 'title') {
        filteredResults.sort((a, b) => a.title.localeCompare(b.title))
      }

      setResults(filteredResults)
      setLoading(false)
    }, 500)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tool':
        return <Calculator className="h-5 w-5" />
      case 'blog':
        return <BookOpen className="h-5 w-5" />
      case 'note':
        return <PenTool className="h-5 w-5" />
      case 'formula':
        return <Target className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tool':
        return 'text-blue-600 bg-blue-100'
      case 'blog':
        return 'text-green-600 bg-green-100'
      case 'note':
        return 'text-purple-600 bg-purple-100'
      case 'formula':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-secondary-600 hover:text-primary-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Search Results
          </h1>
          {query && (
            <p className="text-xl text-secondary-600">
              Results for "{query}" • {results.length} {results.length === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Filters</h2>
              
              {/* Content Type Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-secondary-700 mb-3">Content Type</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Results', count: results.length },
                    { value: 'tool', label: 'Tools', count: results.filter(r => r.type === 'tool').length },
                    { value: 'blog', label: 'Blog Posts', count: results.filter(r => r.type === 'blog').length },
                    { value: 'formula', label: 'Formulas', count: results.filter(r => r.type === 'formula').length },
                    { value: 'note', label: 'Notes', count: results.filter(r => r.type === 'note').length }
                  ].map(({ value, label, count }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="filter"
                        value={value}
                        checked={filter === value}
                        onChange={(e) => setFilter(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-secondary-700">{label} ({count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-sm font-medium text-secondary-700 mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Most Recent</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <h3 className="text-sm font-medium text-secondary-700 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/tools" className="block text-sm text-primary-600 hover:text-primary-700">
                    Browse All Tools →
                  </Link>
                  <Link href="/blog" className="block text-sm text-primary-600 hover:text-primary-700">
                    Read Latest Posts →
                  </Link>
                  <Link href="/tools/formula-repository" className="block text-sm text-primary-600 hover:text-primary-700">
                    Formula Repository →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-4 bg-secondary-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-secondary-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <Link key={result.id} href={result.url} className="block group">
                    <div className="card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)} mr-3`}>
                            {getTypeIcon(result.type)}
                            <span className="ml-1 capitalize">{result.type}</span>
                          </span>
                          {result.category && (
                            <span className="text-xs text-secondary-500">
                              {result.category}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-secondary-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors mb-2">
                        {result.title}
                      </h3>
                      
                      <p className="text-secondary-600 mb-4 line-clamp-2">
                        {result.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-secondary-500">
                        <div className="flex items-center">
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {result.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="bg-secondary-100 text-secondary-600 px-2 py-1 rounded text-xs">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {result.lastUpdated && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Updated {formatDate(result.lastUpdated)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">No results found</h3>
                <p className="text-secondary-600 mb-6">
                  {query ? `No results found for "${query}". ` : ''}
                  Try different keywords or browse our categories.
                </p>
                <div className="space-x-4">
                  <Link href="/tools" className="btn-primary">
                    Browse Tools
                  </Link>
                  <Link href="/blog" className="btn-secondary">
                    Read Blog
                  </Link>
                </div>
              </div>
            )}

            {/* Search Tips */}
            {results.length === 0 && !loading && (
              <div className="card mt-8">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Search Tips</h3>
                <ul className="space-y-2 text-secondary-700">
                  <li>• Try different or more general keywords</li>
                  <li>• Check your spelling</li>
                  <li>• Use fewer words in your search</li>
                  <li>• Browse our categories: Tools, Blog, Formulas</li>
                  <li>• Contact us if you can't find what you're looking for</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
