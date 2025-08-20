'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp,
  FileText,
  Tag,
  Globe,
  Save,
  X,
  Image as ImageIcon,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
  ExternalLink,
  Settings,
  Database,
  Shield,
  LogOut,
  Sparkles,
  Wand2,
  Brain,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import { BlogAuth, AIContentGenerator, RichTextUtils, ImageUpload, type AdminUser } from '@/utils/blogUtils'
import AdminLogin from '@/components/blog/AdminLogin'
import RichTextEditor from '@/components/blog/RichTextEditor'

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
    customUrl?: string
  }
  readTime: number
  views: number
}

interface BlogStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
}

export default function AdminBlogPanel() {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [stats, setStats] = useState<BlogStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // AI Features state
  const [aiGenerating, setAiGenerating] = useState(false)
  const [showAITitles, setShowAITitles] = useState(false)
  const [aiTitles, setAiTitles] = useState<string[]>([])
  const [titleKeywords, setTitleKeywords] = useState('')
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    author: '',
    category: '',
    tags: '',
    featuredImage: '',
    status: 'draft' as 'draft' | 'published',
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      customUrl: ''
    }
  })

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First try to get stored user for quick loading
        const storedUser = BlogAuth.getStoredUser()
        if (storedUser) {
          setUser(storedUser)
        }
        
        // Then verify with server
        const currentUser = await BlogAuth.getCurrentUser()
        if (!currentUser) {
          // Not authenticated, could redirect to login or show 403
          setUser(null)
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      }
    }
    
    checkAuth()
  }, [])

  // Utility functions
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // Generate URL slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }

  // Auto-generate slug when title changes
  const handleTitleChange = (title: string) => {
    const newSlug = generateSlug(title)
    setFormData({ 
      ...formData, 
      title,
      slug: newSlug,
      seo: {
        ...formData.seo,
        customUrl: `/blog/${newSlug}`
      }
    })
  }

  const loadPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/blog?status=all')
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      showMessage('error', 'Failed to load posts')
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

  const loadStats = async () => {
    try {
      const response = await fetch('/api/blog/analytics?type=stats')
      const data = await response.json()
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const filterPosts = () => {
    let filtered = posts

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter)
    }

    if (categoryFilter) {
      filtered = filtered.filter(post => post.category === categoryFilter)
    }

    setFilteredPosts(filtered)
  }

  // Load data only when user is authenticated
  useEffect(() => {
    if (user) {
      loadPosts()
      loadCategories()
      loadStats()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      filterPosts()
    }
  }, [posts, searchQuery, statusFilter, categoryFilter, user])

  // If not authenticated, show login
  if (!user) {
    return <AdminLogin onLogin={setUser} />
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      slug: '',
      author: '',
      category: '',
      tags: '',
      featuredImage: '',
      status: 'draft',
      seo: {
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        customUrl: ''
      }
    })
    setSelectedPost(null)
  }

  const handleCreatePost = async () => {
    setLoading(true)
    try {
      const postData = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(tag => tag.trim()) : formData.tags
      }

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        showMessage('success', 'Post created successfully!')
        setShowCreateModal(false)
        resetForm()
        loadPosts()
      } else {
        throw new Error('Failed to create post')
      }
    } catch (error) {
      showMessage('error', 'Failed to create post')
    }
    setLoading(false)
  }

  const handleEditPost = async () => {
    if (!selectedPost) return

    setLoading(true)
    try {
      const postData = {
        ...formData,
        id: selectedPost.id,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(tag => tag.trim()) : formData.tags
      }

      const response = await fetch('/api/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        showMessage('success', 'Post updated successfully!')
        setShowEditModal(false)
        resetForm()
        loadPosts()
      } else {
        throw new Error('Failed to update post')
      }
    } catch (error) {
      showMessage('error', 'Failed to update post')
    }
    setLoading(false)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/blog?id=${postId}`, { method: 'DELETE' })
      if (response.ok) {
        showMessage('success', 'Post deleted successfully!')
        loadPosts()
      } else {
        throw new Error('Failed to delete post')
      }
    } catch (error) {
      showMessage('error', 'Failed to delete post')
    }
  }

  const logout = () => {
    BlogAuth.logout()
    setUser(null)
  }

  // AI Title Generation
  const generateAITitles = async () => {
    if (!formData.title && !titleKeywords.trim()) {
      showMessage('error', 'Please enter a title or keywords for title generation')
      return
    }

    setAiGenerating(true)
    try {
      const keywords = titleKeywords.trim() || formData.title
      const titles = await AIContentGenerator.generateTitle(keywords)
      setAiTitles(titles)
      setShowAITitles(true)
    } catch (error) {
      showMessage('error', 'Failed to generate titles')
    }
    setAiGenerating(false)
  }

  const selectAITitle = (title: string) => {
    setFormData({ ...formData, title })
    setShowAITitles(false)
    setTitleKeywords('')
  }

  // AI Content Expansion
  const expandContentWithAI = async () => {
    if (!formData.content.trim()) {
      showMessage('error', 'Please add some content outline first')
      return
    }

    setAiLoading(true)
    try {
      const expandedContent = await AIContentGenerator.expandContent(formData.content)
      setFormData({ ...formData, content: expandedContent })
      showMessage('success', 'Content expanded successfully!')
    } catch (error) {
      showMessage('error', 'Failed to expand content')
    }
    setAiLoading(false)
  }

  // AI SEO Generation
  const generateSEOWithAI = async () => {
    if (!formData.title || !formData.content) {
      showMessage('error', 'Please add title and content first')
      return
    }

    setAiLoading(true)
    try {
      const seo = await AIContentGenerator.generateSEO(formData.title, formData.content)
      setFormData({ 
        ...formData, 
        seo: { ...formData.seo, ...seo }
      })
      showMessage('success', 'SEO metadata generated successfully!')
    } catch (error) {
      showMessage('error', 'Failed to generate SEO metadata')
    }
    setAiLoading(false)
  }

  // Button handler functions for modal
  const expandContent = async () => {
    setAiGenerating(true)
    await expandContentWithAI()
    setAiGenerating(false)
  }

  const optimizeSEO = async () => {
    setAiGenerating(true)
    await generateSEOWithAI()
    
    // Also analyze the content for SEO score
    if (formData.title && formData.content) {
      try {
        const analysis = await fetch('/api/ai/content/seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: formData.title, 
            content: formData.content 
          })
        }).then(res => res.json())
        setSeoAnalysis(analysis.analysis)
      } catch (error) {
        console.error('Failed to analyze SEO:', error)
      }
    }
    
    setAiGenerating(false)
  }

  // Auto-generate excerpt and read time
  const updateMetadata = () => {
    if (formData.content) {
      const excerpt = RichTextUtils.generateExcerpt(formData.content)
      setFormData({ ...formData, excerpt })
    }
  }

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = ImageUpload.validateImage(file)
    if (!validation.valid) {
      showMessage('error', validation.error || 'Invalid image')
      return
    }

    try {
      const imageUrl = await ImageUpload.uploadImage(file)
      setFormData({ ...formData, featuredImage: imageUrl })
      showMessage('success', 'Image uploaded successfully!')
    } catch (error) {
      showMessage('error', 'Failed to upload image')
    }
  }

  const editPost = (post: BlogPost) => {
    setSelectedPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      slug: post.slug || generateSlug(post.title),
      author: post.author,
      category: post.category,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags,
      featuredImage: post.featuredImage || '',
      status: post.status,
      seo: {
        metaTitle: post.seo?.metaTitle || '',
        metaDescription: post.seo?.metaDescription || '',
        metaKeywords: post.seo?.metaKeywords || '',
        ogTitle: post.seo?.ogTitle || '',
        ogDescription: post.seo?.ogDescription || '',
        ogImage: post.seo?.ogImage || '',
        customUrl: post.seo?.customUrl || `/blog/${post.slug || generateSlug(post.title)}`
      }
    })
    setShowEditModal(true)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">🔒 Secret Admin Panel</h1>
                <p className="text-sm text-gray-500">Private Blog Management - {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {user.email}
              </div>
              <Link
                href="/blog"
                className="flex items-center text-gray-600 hover:text-indigo-600"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Blog
              </Link>
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-indigo-600"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <button
                onClick={logout}
                className="flex items-center text-red-600 hover:text-red-800"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Notice */}
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">🚨 Admin Only Zone</h3>
              <p className="text-sm text-red-700 mt-1">
                This admin panel is hidden from public access. Do not share this URL with unauthorized users.
              </p>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? 
                <CheckCircle className="h-5 w-5 mr-3" /> : 
                <AlertCircle className="h-5 w-5 mr-3" />
              }
              {message.text}
            </div>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.publishedPosts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draftPosts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                resetForm()
                setShowCreateModal(true)
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Post
            </button>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Blog Posts</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
              <p className="mt-2 text-gray-500">Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new blog post.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {post.featuredImage && (
                            <img
                              src={post.featuredImage}
                              alt=""
                              className="h-10 w-10 rounded object-cover mr-4"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              by {post.author}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.publishedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="h-4 w-4 inline" />
                        </Link>
                        <button
                          onClick={() => editPost(post)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit3 className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {showCreateModal ? 'Create New Post' : 'Edit Post'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                      setSelectedPost(null)
                      resetForm()
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Title *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={titleKeywords}
                            onChange={(e) => setTitleKeywords(e.target.value)}
                            placeholder="Keywords for AI"
                            className="px-2 py-1 text-xs border rounded"
                          />
                          <button
                            onClick={generateAITitles}
                            disabled={aiGenerating}
                            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Generate AI titles"
                          >
                            {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter post title"
                      />
                      
                      {/* AI Title Suggestions */}
                      {showAITitles && aiTitles.length > 0 && (
                        <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm font-medium text-purple-800 mb-2">AI Suggested Titles:</p>
                          <div className="space-y-1">
                            {aiTitles.map((title, index) => (
                              <button
                                key={index}
                                onClick={() => selectAITitle(title)}
                                className="block w-full text-left text-sm text-purple-700 hover:text-purple-900 hover:bg-purple-100 p-2 rounded"
                              >
                                {title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author *
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Study Tips, Tool Guide"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="productivity, study tips, time management"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Brief description of the post"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Content *
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={expandContent}
                          disabled={aiGenerating}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          title="Expand content with AI"
                        >
                          {aiGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
                          <span className="ml-1">Expand</span>
                        </button>
                        <button
                          onClick={optimizeSEO}
                          disabled={aiGenerating}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                          title="Optimize for SEO"
                        >
                          {aiGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
                          <span className="ml-1">SEO</span>
                        </button>
                      </div>
                    </div>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      placeholder="Write your post content..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Featured Image
                      </label>
                      <button
                        onClick={() => document.getElementById('imageUpload')?.click()}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                      >
                        <Upload className="h-3 w-3 inline mr-1" />
                        Upload
                      </button>
                    </div>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <input
                      type="url"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://example.com/image.jpg or upload an image"
                    />
                    {formData.featuredImage && (
                      <div className="mt-2">
                        <img
                          src={formData.featuredImage}
                          alt="Featured image preview"
                          className="w-full max-w-xs h-32 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* SEO Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">SEO Settings</h4>
                      {seoAnalysis && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            seoAnalysis.score >= 80 ? 'bg-green-100 text-green-800' :
                            seoAnalysis.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            SEO Score: {seoAnalysis.score}/100
                          </div>
                          <span className="text-gray-500">
                            {seoAnalysis.readability} readability
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={formData.seo.metaTitle}
                          onChange={(e) => setFormData({
                            ...formData,
                            seo: { ...formData.seo, metaTitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="SEO title for search engines"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Keywords
                        </label>
                        <input
                          type="text"
                          value={formData.seo.metaKeywords}
                          onChange={(e) => setFormData({
                            ...formData,
                            seo: { ...formData.seo, metaKeywords: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={formData.seo.metaDescription}
                        onChange={(e) => setFormData({
                          ...formData,
                          seo: { ...formData.seo, metaDescription: e.target.value }
                        })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Description for search engines (150-160 characters)"
                        maxLength={160}
                      />
                    </div>
                    
                    {/* Custom URL/Slug Field */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="h-4 w-4 inline mr-1" />
                        Custom URL
                      </label>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          https://campustoolshub.com/blog/
                        </span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => {
                            const newSlug = e.target.value
                              .toLowerCase()
                              .replace(/[^\w\s-]/g, '')
                              .replace(/\s+/g, '-')
                              .replace(/-+/g, '-')
                              .replace(/^-|-$/g, '')
                            setFormData({
                              ...formData,
                              slug: newSlug,
                              seo: { ...formData.seo, customUrl: `/blog/${newSlug}` }
                            })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="post-url-slug"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        URL-friendly version of the title. Auto-generated from title but can be customized.
                      </p>
                      {formData.seo.customUrl && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>Full URL:</strong> 
                            <span className="font-mono ml-2 text-blue-900">
                              https://campustoolshub.com{formData.seo.customUrl}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                      setSelectedPost(null)
                      resetForm()
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={showCreateModal ? handleCreatePost : handleEditPost}
                    disabled={loading || !formData.title || !formData.content}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Saving...' : (showCreateModal ? 'Create Post' : 'Update Post')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}