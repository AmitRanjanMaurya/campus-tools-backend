'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Filter, Clock, User, Tag, Eye, Calendar, ChevronRight, BookOpen, TrendingUp, Star } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  author: string
  category: string
  tags: string[]
  featuredImage?: string
  publishedAt: Date
  updatedAt: Date
  status: 'draft' | 'published'
  seo: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
  }
  readTime: number
  views: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
    loadCategories()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, selectedCategory])

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/blog?status=published')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    }
    setLoading(false)
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/blog/analytics?type=categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const filterPosts = () => {
    let filtered = posts

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    setFilteredPosts(filtered)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Study Tips': 'text-blue-600 bg-blue-100',
      'Tool Guide': 'text-green-600 bg-green-100',
      'Academic Success': 'text-purple-600 bg-purple-100',
      'Productivity': 'text-orange-600 bg-orange-100',
      'Technology': 'text-indigo-600 bg-indigo-100',
      'Career Guidance': 'text-pink-600 bg-pink-100',
      'Time Management': 'text-teal-600 bg-teal-100',
      'Research Methods': 'text-red-600 bg-red-100',
      'Exam Preparation': 'text-yellow-600 bg-yellow-100',
      'Life Skills': 'text-gray-600 bg-gray-100'
    }
    return colors[category as keyof typeof colors] || 'text-primary-600 bg-primary-100'
  }

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center text-secondary-600 hover:text-primary-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            StudentTools Blog
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Tips, tutorials, and insights to help you make the most of your academic journey
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-secondary-600">Loading blog posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              {searchQuery || selectedCategory ? 'No posts found' : 'No blog posts yet'}
            </h3>
            <p className="text-secondary-600 mb-6">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Check back soon for valuable content and insights!'}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {filteredPosts.length > 0 && (
              <div className="card mb-8 overflow-hidden">
                <div className="md:flex">
                  {filteredPosts[0].featuredImage && (
                    <div className="md:w-1/3">
                      <img
                        src={filteredPosts[0].featuredImage}
                        alt={filteredPosts[0].title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`p-6 ${filteredPosts[0].featuredImage ? 'md:w-2/3' : 'w-full'}`}>
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full mr-2 ${getCategoryColor(filteredPosts[0].category)}`}>
                        {filteredPosts[0].category}
                      </span>
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-secondary-500">Featured</span>
                    </div>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-3 hover:text-primary-600 cursor-pointer">
                      <Link href={`/blog/${filteredPosts[0].slug}`}>
                        {filteredPosts[0].title}
                      </Link>
                    </h2>
                    <p className="text-secondary-600 mb-4 leading-relaxed">
                      {filteredPosts[0].excerpt}
                    </p>
                    <div className="flex items-center text-sm text-secondary-500 mb-4">
                      <User className="h-4 w-4 mr-1" />
                      <span className="mr-4">{filteredPosts[0].author}</span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="mr-4">{formatDate(filteredPosts[0].publishedAt)}</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="mr-4">{filteredPosts[0].readTime} min read</span>
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{filteredPosts[0].views} views</span>
                    </div>
                    <Link href={`/blog/${filteredPosts[0].slug}`} className="btn-primary inline-flex items-center">
                      Read More
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredPosts.slice(1).map((post) => (
                <div key={post.id} className="card overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2 hover:text-primary-600 cursor-pointer">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-xs text-secondary-500 mb-4">
                      <User className="h-3 w-3 mr-1" />
                      <span className="mr-3">{post.author}</span>
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="mr-3">{post.readTime} min</span>
                      <Eye className="h-3 w-3 mr-1" />
                      <span>{post.views}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-secondary-100 text-secondary-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-secondary-100 text-secondary-600 rounded">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                    <Link href={`/blog/${post.slug}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                      Read More
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tools" className="btn-primary">
              Explore Tools
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
