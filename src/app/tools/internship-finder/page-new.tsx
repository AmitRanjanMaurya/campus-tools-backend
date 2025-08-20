'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  MapPin, 
  Building, 
  Clock, 
  DollarSign, 
  Filter, 
  BookmarkPlus, 
  Bookmark, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  Download, 
  Share2, 
  Heart, 
  TrendingUp,
  Briefcase,
  GraduationCap,
  Target,
  Award,
  X,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Send,
  Upload,
  ArrowLeft,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Settings,
  Bell,
  BookOpen,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

// Enhanced Types
interface Internship {
  id: string
  title: string
  company: string
  location: string
  type: 'remote' | 'onsite' | 'hybrid'
  duration: string
  stipend: number
  currency: string
  description: string
  requirements: string[]
  skills: string[]
  applicationDeadline: string
  startDate: string
  isBookmarked: boolean
  applicationStatus: 'not-applied' | 'applied' | 'interviewing' | 'selected' | 'rejected'
  companyLogo?: string
  companyRating: number
  postedDate: string
  applicants: number
  category: string
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  applicationLink: string
  benefits: string[]
  companySize: string
  industry: string
  workingHours: string
  isPremium: boolean
  isUrgent: boolean
  contactEmail?: string
  hrContact?: {
    name: string
    email: string
    phone?: string
  }
}

interface FilterOptions {
  location: string
  type: string
  category: string
  experienceLevel: string
  minStipend: number
  maxStipend: number
  duration: string
  skills: string[]
  company: string
  isPremium: boolean
  isUrgent: boolean
  industry: string
}

interface UserProfile {
  name: string
  email: string
  phone: string
  skills: string[]
  experience: string
  resume: File | null
  resumeUrl?: string
  preferences: {
    locations: string[]
    categories: string[]
    minStipend: number
    workType: string[]
    industries: string[]
  }
  education: {
    degree: string
    institution: string
    graduationYear: string
    cgpa: string
  }
  projects: Array<{
    title: string
    description: string
    technologies: string[]
    link?: string
  }>
  certifications: string[]
  linkedinUrl?: string
  portfolioUrl?: string
}

interface ApplicationData {
  coverLetter: string
  customResume?: File
  availability: string
  expectedStipend: number
  additionalInfo: string
}

export default function InternshipFinder() {
  // Enhanced State management
  const [internships, setInternships] = useState<Internship[]>([])
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentView, setCurrentView] = useState<'search' | 'bookmarks' | 'applications' | 'profile' | 'analytics'>('search')
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  
  // Enhanced Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    type: '',
    category: '',
    experienceLevel: '',
    minStipend: 0,
    maxStipend: 100000,
    duration: '',
    skills: [],
    company: '',
    isPremium: false,
    isUrgent: false,
    industry: ''
  })

  // Enhanced User profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    skills: [],
    experience: '',
    resume: null,
    preferences: {
      locations: [],
      categories: [],
      minStipend: 0,
      workType: [],
      industries: []
    },
    education: {
      degree: '',
      institution: '',
      graduationYear: '',
      cgpa: ''
    },
    projects: [],
    certifications: []
  })

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    coverLetter: '',
    availability: '',
    expectedStipend: 0,
    additionalInfo: ''
  })

  const [bookmarkedInternships, setBookmarkedInternships] = useState<string[]>([])
  const [appliedInternships, setAppliedInternships] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'stipend' | 'company'>('relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const mockInternships: Internship[] = [
    {
      id: '1',
      title: 'Frontend Developer Intern',
      company: 'TechCorp Solutions',
      location: 'Bangalore',
      type: 'hybrid',
      duration: '3 months',
      stipend: 25000,
      currency: 'INR',
      description: 'Work on exciting web applications using React and modern JavaScript frameworks. You will be part of our frontend team building user-friendly interfaces for our SaaS products.',
      requirements: [
        'Currently pursuing B.Tech/MCA in Computer Science',
        'Basic knowledge of JavaScript, HTML, CSS',
        'Familiar with React concepts and component lifecycle',
        'Understanding of version control (Git)',
        'Strong problem-solving skills'
      ],
      skills: ['JavaScript', 'React', 'HTML/CSS', 'Git', 'REST APIs', 'Responsive Design'],
      applicationDeadline: '2025-08-15',
      startDate: '2025-09-01',
      isBookmarked: false,
      applicationStatus: 'not-applied',
      companyLogo: '/companies/techcorp.png',
      companyRating: 4.2,
      postedDate: '2025-07-20',
      applicants: 156,
      category: 'Software Development',
      experienceLevel: 'beginner',
      applicationLink: 'https://techcorp.com/apply/frontend-intern',
      benefits: ['Flexible work hours', 'Learning stipend', 'Mentorship program', 'Certificate'],
      companySize: '51-200 employees',
      industry: 'Technology',
      workingHours: '9 AM - 6 PM (Flexible)',
      isPremium: true,
      isUrgent: false,
      hrContact: {
        name: 'Priya Sharma',
        email: 'priya.sharma@techcorp.com',
        phone: '+91-9876543210'
      }
    },
    {
      id: '2',
      title: 'Data Science Intern',
      company: 'Analytics Hub',
      location: 'Mumbai',
      type: 'onsite',
      duration: '6 months',
      stipend: 35000,
      currency: 'INR',
      description: 'Join our data science team to work on machine learning projects and data analysis. Gain hands-on experience with real-world datasets from various industries.',
      requirements: [
        'Statistics/Mathematics/Data Science background',
        'Proficiency in Python programming',
        'Basic knowledge of Machine Learning algorithms',
        'Experience with SQL and data manipulation',
        'Strong analytical and problem-solving skills'
      ],
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'Pandas', 'NumPy', 'Matplotlib'],
      applicationDeadline: '2025-08-20',
      startDate: '2025-09-15',
      isBookmarked: false,
      applicationStatus: 'not-applied',
      companyLogo: '/companies/analytics-hub.png',
      companyRating: 4.5,
      postedDate: '2025-07-25',
      applicants: 89,
      category: 'Data Science',
      experienceLevel: 'intermediate',
      applicationLink: 'https://analyticshub.com/careers/data-science-intern',
      benefits: ['Health insurance', 'Free meals', 'Training programs', 'PPO opportunity'],
      companySize: '201-500 employees',
      industry: 'Technology',
      workingHours: '10 AM - 7 PM',
      isPremium: false,
      isUrgent: true,
      hrContact: {
        name: 'Raj Patel',
        email: 'raj.patel@analyticshub.com'
      }
    }
  ]

  // Categories and options
  const categories = [
    'Software Development', 'Data Science', 'Machine Learning', 'Web Development',
    'Marketing', 'Digital Marketing', 'Design', 'UI/UX Design', 'Business Development',
    'Finance', 'Human Resources', 'Content Writing', 'Sales', 'Research', 'Operations',
    'Consulting', 'Product Management', 'Engineering', 'Legal'
  ]

  const locations = [
    'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
    'Ahmedabad', 'Gurgaon', 'Noida', 'Jaipur', 'Kochi', 'Remote', 'Pan India'
  ]

  // Utility functions
  const formatCurrency = (amount: number, currency: string = 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`
    }
    return `${currency} ${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'remote': return 'bg-blue-100 text-blue-800'
      case 'onsite': return 'bg-purple-100 text-purple-800'
      case 'hybrid': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // useEffect hooks
  useEffect(() => {
    setInternships(mockInternships)
    setFilteredInternships(mockInternships)
    
    // Load saved data from localStorage
    const savedBookmarks = localStorage.getItem('bookmarkedInternships')
    const savedApplications = localStorage.getItem('appliedInternships')
    const savedProfile = localStorage.getItem('userProfile')
    
    if (savedBookmarks) {
      setBookmarkedInternships(JSON.parse(savedBookmarks))
    }
    if (savedApplications) {
      setAppliedInternships(JSON.parse(savedApplications))
    }
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    }
  }, [])

  useEffect(() => {
    filterInternships()
  }, [searchQuery, filters, internships, sortBy])

  // Filtering logic
  const filterInternships = () => {
    let filtered = internships.filter(internship => {
      const matchesSearch = searchQuery === '' || 
        internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesLocation = filters.location === '' || internship.location === filters.location
      const matchesType = filters.type === '' || internship.type === filters.type
      const matchesCategory = filters.category === '' || internship.category === filters.category
      const matchesExperience = filters.experienceLevel === '' || internship.experienceLevel === filters.experienceLevel
      const matchesStipend = internship.stipend >= filters.minStipend && internship.stipend <= filters.maxStipend

      return matchesSearch && matchesLocation && matchesType && matchesCategory && 
             matchesExperience && matchesStipend
    })

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        case 'stipend':
          return b.stipend - a.stipend
        case 'company':
          return a.company.localeCompare(b.company)
        case 'relevance':
        default:
          return b.companyRating - a.companyRating
      }
    })

    setFilteredInternships(filtered)
  }

  // Action handlers
  const handleBookmark = (internshipId: string) => {
    setBookmarkedInternships(prev => {
      const updated = prev.includes(internshipId) 
        ? prev.filter(id => id !== internshipId)
        : [...prev, internshipId]
      localStorage.setItem('bookmarkedInternships', JSON.stringify(updated))
      return updated
    })
  }

  const handleApply = (internship: Internship) => {
    setSelectedInternship(internship)
    setApplicationData({
      coverLetter: '',
      availability: '',
      expectedStipend: internship.stipend,
      additionalInfo: ''
    })
    setShowApplicationModal(true)
  }

  const submitApplication = async () => {
    if (!selectedInternship) return
    
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const updated = [...appliedInternships, selectedInternship.id]
      setAppliedInternships(updated)
      localStorage.setItem('appliedInternships', JSON.stringify(updated))
      setShowApplicationModal(false)
      setSelectedInternship(null)
      setLoading(false)
      
      alert('Application submitted successfully!')
    }, 2000)
  }

  const addSkill = () => {
    if (skillInput.trim() && !userProfile.skills.includes(skillInput.trim())) {
      const updated = {
        ...userProfile,
        skills: [...userProfile.skills, skillInput.trim()]
      }
      setUserProfile(updated)
      localStorage.setItem('userProfile', JSON.stringify(updated))
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    const updated = {
      ...userProfile,
      skills: userProfile.skills.filter(s => s !== skill)
    }
    setUserProfile(updated)
    localStorage.setItem('userProfile', JSON.stringify(updated))
  }

  const resetFilters = () => {
    setFilters({
      location: '',
      type: '',
      category: '',
      experienceLevel: '',
      minStipend: 0,
      maxStipend: 100000,
      duration: '',
      skills: [],
      company: '',
      isPremium: false,
      isUrgent: false,
      industry: ''
    })
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/tools" className="text-secondary-600 hover:text-primary-600 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-secondary-900">Internship Finder</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('search')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                currentView === 'search' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-secondary-600 hover:bg-primary-50'
              }`}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
            <button
              onClick={() => setCurrentView('bookmarks')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                currentView === 'bookmarks' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-secondary-600 hover:bg-primary-50'
              }`}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Saved ({bookmarkedInternships.length})
            </button>
            <button
              onClick={() => setCurrentView('applications')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                currentView === 'applications' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-secondary-600 hover:bg-primary-50'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Applied ({appliedInternships.length})
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Profile
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        {currentView === 'search' && (
          <>
            <div className="card mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search internships by title, company, or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="relevance">Sort by Relevance</option>
                    <option value="date">Sort by Date</option>
                    <option value="stipend">Sort by Stipend</option>
                    <option value="company">Sort by Company</option>
                  </select>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 rounded-lg flex items-center ${
                      showFilters 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white border border-secondary-300 text-secondary-600'
                    }`}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Location</label>
                    <select
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Locations</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Work Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Types</option>
                      <option value="remote">Remote</option>
                      <option value="onsite">On-site</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Categories</option>
                      {categories.slice(0, 10).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Experience Level</label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Min Stipend</label>
                    <input
                      type="number"
                      value={filters.minStipend}
                      onChange={(e) => setFilters({ ...filters, minStipend: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Min amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Max Stipend</label>
                    <input
                      type="number"
                      value={filters.maxStipend}
                      onChange={(e) => setFilters({ ...filters, maxStipend: parseInt(e.target.value) || 100000 })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Max amount"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      onClick={resetFilters}
                      className="w-full px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-secondary-900">
                  {filteredInternships.length} Internships Found
                </h2>
                <p className="text-secondary-600">
                  {searchQuery && `Results for "${searchQuery}"`}
                </p>
              </div>
            </div>

            {/* Internship Cards */}
            <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredInternships.map((internship) => (
                <div
                  key={internship.id}
                  className={`card hover:shadow-lg transition-all duration-200 ${
                    internship.isPremium ? 'ring-2 ring-yellow-200' : ''
                  } ${internship.isUrgent ? 'border-l-4 border-l-red-400' : ''}`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {internship.companyLogo ? (
                        <img
                          src={internship.companyLogo}
                          alt={internship.company}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-secondary-900 hover:text-primary-600 cursor-pointer">
                          {internship.title}
                        </h3>
                        <p className="text-secondary-600 text-sm">{internship.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {internship.isPremium && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </span>
                      )}
                      {internship.isUrgent && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <Zap className="h-3 w-3 mr-1" />
                          Urgent
                        </span>
                      )}
                      <button
                        onClick={() => handleBookmark(internship.id)}
                        className={`p-2 rounded-full transition-colors ${
                          bookmarkedInternships.includes(internship.id)
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-secondary-100 text-secondary-400 hover:bg-secondary-200'
                        }`}
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-secondary-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {internship.location}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadgeColor(internship.type)}`}>
                        {internship.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getExperienceBadgeColor(internship.experienceLevel)}`}>
                        {internship.experienceLevel}
                      </span>
                    </div>

                    <p className="text-secondary-700 text-sm line-clamp-2">{internship.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-lg font-semibold text-green-600">
                        <DollarSign className="h-5 w-5 mr-1" />
                        {formatCurrency(internship.stipend, internship.currency)}
                        <span className="text-sm text-secondary-500 ml-1">/ month</span>
                      </div>
                      <div className="text-sm text-secondary-500">
                        {internship.duration}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-secondary-500">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {internship.applicants} applied
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Deadline: {formatDate(internship.applicationDeadline)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {internship.skills.slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {internship.skills.length > 3 && (
                        <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded">
                          +{internship.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-secondary-200">
                    <button
                      onClick={() => handleApply(internship)}
                      disabled={appliedInternships.includes(internship.id)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        appliedInternships.includes(internship.id)
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {appliedInternships.includes(internship.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 inline mr-2" />
                          Applied
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 inline mr-2" />
                          Apply Now
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setExpandedCard(expandedCard === internship.id ? null : internship.id)}
                      className="px-4 py-2 border border-secondary-300 rounded-lg text-secondary-600 hover:bg-secondary-50"
                    >
                      {expandedCard === internship.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {expandedCard === internship.id && (
                    <div className="mt-4 pt-4 border-t border-secondary-200 space-y-4">
                      <div>
                        <h4 className="font-medium text-secondary-900 mb-2">Requirements:</h4>
                        <ul className="list-disc list-inside text-sm text-secondary-600 space-y-1">
                          {internship.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-secondary-900 mb-2">Skills Required:</h4>
                        <div className="flex flex-wrap gap-1">
                          {internship.skills.map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {internship.benefits && (
                        <div>
                          <h4 className="font-medium text-secondary-900 mb-2">Benefits:</h4>
                          <div className="flex flex-wrap gap-1">
                            {internship.benefits.map(benefit => (
                              <span
                                key={benefit}
                                className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded"
                              >
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-secondary-700">Company Size:</span>
                          <p className="text-secondary-600">{internship.companySize}</p>
                        </div>
                        <div>
                          <span className="font-medium text-secondary-700">Working Hours:</span>
                          <p className="text-secondary-600">{internship.workingHours}</p>
                        </div>
                        <div>
                          <span className="font-medium text-secondary-700">Start Date:</span>
                          <p className="text-secondary-600">{formatDate(internship.startDate)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-secondary-700">Rating:</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-secondary-600">{internship.companyRating}/5</span>
                          </div>
                        </div>
                      </div>

                      {internship.hrContact && (
                        <div>
                          <h4 className="font-medium text-secondary-900 mb-2">HR Contact:</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-secondary-600">{internship.hrContact.name}</p>
                            <p className="text-secondary-600">{internship.hrContact.email}</p>
                            {internship.hrContact.phone && (
                              <p className="text-secondary-600">{internship.hrContact.phone}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Other views content */}
        {currentView === 'bookmarks' && (
          <div className="text-center py-12">
            <Bookmark className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Bookmarked Internships</h3>
            <p className="text-secondary-600">
              {bookmarkedInternships.length === 0 
                ? 'No bookmarked internships yet. Start exploring and save your favorites!' 
                : `You have ${bookmarkedInternships.length} bookmarked internships.`}
            </p>
          </div>
        )}

        {currentView === 'applications' && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Your Applications</h3>
            <p className="text-secondary-600">
              {appliedInternships.length === 0 
                ? 'No applications submitted yet. Find the perfect internship and apply!' 
                : `You have applied to ${appliedInternships.length} internships.`}
            </p>
          </div>
        )}

        {/* Application Modal */}
        {showApplicationModal && selectedInternship && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-secondary-900">
                    Apply for {selectedInternship.title}
                  </h3>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Cover Letter *
                    </label>
                    <textarea
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tell us why you're perfect for this role..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Availability
                    </label>
                    <input
                      type="text"
                      value={applicationData.availability}
                      onChange={(e) => setApplicationData({ ...applicationData, availability: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="When can you start?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Expected Stipend
                    </label>
                    <input
                      type="number"
                      value={applicationData.expectedStipend}
                      onChange={(e) => setApplicationData({ ...applicationData, expectedStipend: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your expected stipend"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Additional Information
                    </label>
                    <textarea
                      value={applicationData.additionalInfo}
                      onChange={(e) => setApplicationData({ ...applicationData, additionalInfo: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Any additional information you'd like to share..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="px-4 py-2 text-secondary-600 hover:text-secondary-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitApplication}
                    disabled={loading || !applicationData.coverLetter.trim()}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-secondary-900">Profile Settings</h3>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+91-9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={userProfile.experience}
                      onChange={(e) => setUserProfile({ ...userProfile, experience: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Experience</option>
                      <option value="fresher">Fresher</option>
                      <option value="0-1-years">0-1 Years</option>
                      <option value="1-2-years">1-2 Years</option>
                      <option value="2-3-years">2-3 Years</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {userProfile.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-3 py-2 border border-secondary-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Add a skill..."
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 text-secondary-600 hover:text-secondary-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('userProfile', JSON.stringify(userProfile))
                      setShowProfileModal(false)
                      alert('Profile saved successfully!')
                    }}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Save Profile
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
