'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Head from 'next/head'
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Tag, 
  Eye, 
  Calendar, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  ThumbsUp,
  MessageCircle,
  ChevronRight,
  Copy,
  Check,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react'

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

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (slug) {
      loadPost()
    }
  }, [slug])

  useEffect(() => {
    if (post) {
      loadRelatedPosts()
      updateSEO()
    }
  }, [post])

  const loadPost = async () => {
    try {
      const response = await fetch(`/api/blog?slug=${slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      }
    } catch (error) {
      console.error('Error loading post:', error)
    }
    setLoading(false)
  }

  const loadRelatedPosts = async () => {
    if (!post) return
    
    try {
      const response = await fetch(`/api/blog?category=${post.category}&limit=3`)
      const data = await response.json()
      // Filter out current post
      const related = data.posts.filter((p: BlogPost) => p.id !== post.id).slice(0, 3)
      setRelatedPosts(related)
    } catch (error) {
      console.error('Error loading related posts:', error)
    }
  }

  const updateSEO = () => {
    if (!post) return

    // Update document title and meta tags
    document.title = post.seo.metaTitle || post.title
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', post.seo.metaDescription || post.excerpt)
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metaKeywords.setAttribute('content', post.seo.metaKeywords || post.tags.join(', '))
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', post.seo.ogTitle || post.title)
    }

    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', post.seo.ogDescription || post.excerpt)
    }

    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage && post.seo.ogImage) {
      ogImage.setAttribute('content', post.seo.ogImage)
    }
  }

  const sharePost = (platform: string) => {
    if (!post) return
    
    const url = window.location.href
    const title = post.title
    const text = post.excerpt
    
    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        return
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: url
        })
      } catch (error) {
        // Fallback to copy to clipboard
        sharePost('copy')
      }
    } else {
      // Fallback to copy to clipboard
      sharePost('copy')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const renderMarkdown = (content: string) => {
    // Simple markdown renderer for headers, bold, italic, links
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-secondary-900 mb-6 mt-8">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-secondary-900 mb-4 mt-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-secondary-900 mb-3 mt-5">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-600 hover:text-primary-700 underline">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/gm, '<p class="mb-4">$1</p>')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-secondary-600">Loading post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">Post Not Found</h1>
            <p className="text-secondary-600 mb-6">The blog post you're looking for doesn't exist.</p>
            <Link href="/blog" className="btn-primary">
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/blog" className="flex items-center text-secondary-600 hover:text-primary-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Blog
          </Link>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-2 text-secondary-600 hover:text-primary-600 rounded-lg hover:bg-white"
            >
              {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-secondary-600 hover:text-primary-600 rounded-lg hover:bg-white"
            >
              {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Article */}
        <article className="card mb-8">
          {/* Featured Image */}
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 md:h-80 object-cover rounded-t-lg"
            />
          )}

          <div className="p-6 md:p-8">
            {/* Category and Meta */}
            <div className="flex items-center mb-4">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getCategoryColor(post.category)}`}>
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center text-sm text-secondary-500 mb-6 gap-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{post.readTime} min read</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{post.views} views</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-secondary-100 text-secondary-600 rounded-lg hover:bg-secondary-200 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Social Sharing */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-secondary-200">
              <span className="text-sm font-medium text-secondary-700">Share this post:</span>
              <button
                onClick={() => sharePost('twitter')}
                className="p-2 text-secondary-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                title="Share on Twitter"
              >
                <Twitter className="h-4 w-4" />
              </button>
              <button
                onClick={() => sharePost('facebook')}
                className="p-2 text-secondary-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Share on Facebook"
              >
                <Facebook className="h-4 w-4" />
              </button>
              <button
                onClick={() => sharePost('linkedin')}
                className="p-2 text-secondary-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </button>
              <button
                onClick={() => sharePost('copy')}
                className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none text-secondary-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-secondary-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Helpful</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-secondary-600 rounded-lg hover:bg-secondary-200 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span>Comment</span>
                </button>
              </div>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="card">
            <h3 className="text-2xl font-bold text-secondary-900 mb-6">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <div className="border border-secondary-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {relatedPost.featuredImage && (
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(relatedPost.category)}`}>
                        {relatedPost.category}
                      </span>
                      <h4 className="font-semibold text-secondary-900 mt-2 mb-2 group-hover:text-primary-600 transition-colors">
                        {relatedPost.title}
                      </h4>
                      <p className="text-sm text-secondary-600 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-secondary-500 mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{relatedPost.readTime} min read</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
