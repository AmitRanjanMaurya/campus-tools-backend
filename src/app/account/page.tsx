'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { 
  User, 
  Settings, 
  BarChart3, 
  Shield, 
  LogOut, 
  Edit3, 
  Trash2, 
  Download, 
  Clock, 
  Trophy, 
  Target, 
  BookOpen, 
  Calculator, 
  Brain, 
  Timer, 
  FileText, 
  CreditCard,
  Calendar,
  Activity,
  Plus,
  Eye,
  Archive,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  PieChart,
  Zap,
  Star,
  Award,
  Bookmark,
  Share,
  RefreshCw
} from 'lucide-react'

interface UserData {
  userId: string
  email: string
  name: string
  joinedAt: string
  avatar?: string
  toolsUsed: string[]
  flashcards: FlashcardData[]
  resumes: ResumeData[]
  quizzes: QuizData[]
  notes: NoteData[]
  dietPlans: DietPlanData[]
  studyStats: StudyStats
  goals: UserGoals
  settings: UserSettings
  recentActivity: ActivityData[]
}

interface FlashcardData {
  id: string
  title: string
  cardCount: number
  category: string
  createdAt: string
  lastStudied?: string
}

interface ResumeData {
  id: string
  title: string
  progress: number
  createdAt: string
  lastModified: string
}

interface QuizData {
  id: string
  topic: string
  score: number
  total: number
  date: string
  duration: number
}

interface NoteData {
  id: string
  title: string
  category: string
  wordCount: number
  createdAt: string
  lastModified: string
}

interface DietPlanData {
  id: string
  title: string
  type: string
  createdAt: string
  calories: number
}

interface StudyStats {
  totalStudyTime: number
  studyStreak: number
  sessionsCompleted: number
  averageSessionLength: number
  focusScore: number
  weeklyGoalProgress: number
}

interface UserGoals {
  gpaTarget?: number
  currentGPA?: number
  savingsGoal?: {
    goal: number
    current: number
    name: string
  }
  studyTimeGoal?: number
  weeklyStudyGoal?: number
}

interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean
  analytics: boolean
  privacy: {
    profileVisibility: 'public' | 'private'
    shareProgress: boolean
  }
  autoSave: boolean
  syncEnabled: boolean
}

interface ActivityData {
  id: string
  action: string
  tool: string
  timestamp: string
  details?: string
}

export default function AccountDashboard() {
  const { user, logout, updateProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: '',
    university: '',
    major: '',
    year: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadUserData()
  }, [user, router])

  const loadUserData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Load data from localStorage (in production, this would be API calls)
      const flashcards = JSON.parse(localStorage.getItem(`student_tools_${user.id}_flashcards`) || '[]')
      const resumes = JSON.parse(localStorage.getItem(`student_tools_${user.id}_resumes`) || '[]')
      const quizzes = JSON.parse(localStorage.getItem(`student_tools_${user.id}_quizzes`) || '[]')
      const notes = JSON.parse(localStorage.getItem(`student_tools_${user.id}_notes`) || '[]')
      const dietPlans = JSON.parse(localStorage.getItem(`student_tools_${user.id}_dietPlans`) || '[]')
        .filter((plan: any) => plan.userId === user.email)
      const studyStats = JSON.parse(localStorage.getItem(`student_tools_${user.id}_studyStats`) || '{}')
      const goals = JSON.parse(localStorage.getItem(`student_tools_${user.id}_goals`) || '{}')
      const settings = JSON.parse(localStorage.getItem(`student_tools_${user.id}_settings`) || '{}')
      const recentActivity = JSON.parse(localStorage.getItem(`student_tools_${user.id}_activity`) || '[]')

      // Get unique tools used
      const toolsUsed = Array.from(new Set([
        ...flashcards.length > 0 ? ['flashcards'] : [],
        ...resumes.length > 0 ? ['resume-builder'] : [],
        ...quizzes.length > 0 ? ['quiz-generator'] : [],
        ...notes.length > 0 ? ['notes'] : [],
        ...dietPlans.length > 0 ? ['diet-planner'] : [],
        ...studyStats.sessionsCompleted ? ['study-timer'] : []
      ]))

      const data: UserData = {
        userId: user.id,
        email: user.email,
        name: user.name,
        joinedAt: user.joinedAt || new Date().toISOString(),
        avatar: user.avatar,
        toolsUsed,
        flashcards: flashcards.map((fc: any, index: number) => ({
          id: fc.id || `fc_${index}`,
          title: fc.title || `Flashcard Set ${index + 1}`,
          cardCount: fc.cards?.length || 0,
          category: fc.category || 'General',
          createdAt: fc.createdAt || new Date().toISOString(),
          lastStudied: fc.lastStudied
        })),
        resumes: resumes.map((resume: any, index: number) => ({
          id: resume.id || `resume_${index}`,
          title: resume.title || `Resume ${index + 1}`,
          progress: resume.progress || 0,
          createdAt: resume.createdAt || new Date().toISOString(),
          lastModified: resume.lastModified || new Date().toISOString()
        })),
        quizzes: quizzes.map((quiz: any, index: number) => ({
          id: quiz.id || `quiz_${index}`,
          topic: quiz.topic || 'General Knowledge',
          score: quiz.score || 0,
          total: quiz.total || 10,
          date: quiz.date || new Date().toISOString(),
          duration: quiz.duration || 0
        })),
        notes: notes.map((note: any, index: number) => ({
          id: note.id || `note_${index}`,
          title: note.title || `Note ${index + 1}`,
          category: note.category || 'General',
          wordCount: note.content?.split(' ').length || 0,
          createdAt: note.createdAt || new Date().toISOString(),
          lastModified: note.lastModified || new Date().toISOString()
        })),
        dietPlans: dietPlans.map((plan: any, index: number) => ({
          id: plan.id || `diet_${index}`,
          title: plan.title || `Diet Plan ${index + 1}`,
          type: plan.type || 'General',
          createdAt: plan.createdAt || new Date().toISOString(),
          calories: plan.nutrition?.calories || 0
        })),
        studyStats: {
          totalStudyTime: studyStats.totalStudyTime || 0,
          studyStreak: studyStats.studyStreak || 0,
          sessionsCompleted: studyStats.sessionsCompleted || 0,
          averageSessionLength: studyStats.averageSessionLength || 0,
          focusScore: studyStats.focusScore || 0,
          weeklyGoalProgress: studyStats.weeklyGoalProgress || 0
        },
        goals: {
          gpaTarget: goals.gpaTarget,
          currentGPA: goals.currentGPA,
          savingsGoal: goals.savingsGoal,
          studyTimeGoal: goals.studyTimeGoal || 25, // Default 25 hours per week
          weeklyStudyGoal: goals.weeklyStudyGoal || 5 // Default 5 sessions per week
        },
        settings: {
          theme: settings.theme || 'light',
          notifications: settings.notifications !== false,
          analytics: settings.analytics !== false,
          privacy: {
            profileVisibility: settings.privacy?.profileVisibility || 'private',
            shareProgress: settings.privacy?.shareProgress || false
          },
          autoSave: settings.autoSave !== false,
          syncEnabled: settings.syncEnabled !== false
        },
        recentActivity: recentActivity.slice(0, 10) // Show last 10 activities
      }

      setUserData(data)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    try {
      await updateProfile(profileForm)
      setIsEditingProfile(false)
      loadUserData() // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleDeleteData = (type: string, id: string) => {
    if (!user || !userData) return
    
    const confirmed = window.confirm(`Are you sure you want to delete this ${type}?`)
    if (!confirmed) return

    try {
      const storageKey = `student_tools_${user.id}_${type}`
      const currentData = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const updatedData = currentData.filter((item: any) => item.id !== id)
      localStorage.setItem(storageKey, JSON.stringify(updatedData))
      
      // Add activity log
      logActivity(`Deleted ${type}`, type, `Removed item: ${id}`)
      
      loadUserData() // Refresh data
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
    }
  }

  const handleExportData = (type: string, data: any) => {
    try {
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${user?.name || 'user'}_${type}_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      logActivity(`Exported ${type}`, type, `Exported ${Array.isArray(data) ? data.length : 1} items`)
    } catch (error) {
      console.error(`Error exporting ${type}:`, error)
    }
  }

  const logActivity = (action: string, tool: string, details?: string) => {
    if (!user) return
    
    const activity: ActivityData = {
      id: Date.now().toString(),
      action,
      tool,
      timestamp: new Date().toISOString(),
      details
    }
    
    const currentActivity = JSON.parse(localStorage.getItem(`student_tools_${user.id}_activity`) || '[]')
    const updatedActivity = [activity, ...currentActivity].slice(0, 50) // Keep last 50 activities
    localStorage.setItem(`student_tools_${user.id}_activity`, JSON.stringify(updatedActivity))
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    )
    
    if (confirmed) {
      const doubleConfirmed = window.confirm(
        'This is your final warning. Deleting your account will remove all your flashcards, resumes, notes, and other saved data. Type DELETE to confirm.'
      )
      
      if (doubleConfirmed) {
        // Clear all user data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`student_tools_${user?.id}_`) || key.startsWith('student_tools_user')) {
            localStorage.removeItem(key)
          }
        })
        
        logout()
        router.push('/')
      }
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getToolIcon = (tool: string) => {
    const icons: { [key: string]: any } = {
      'flashcards': Brain,
      'resume-builder': FileText,
      'quiz-generator': BookOpen,
      'notes': Edit3,
      'diet-planner': Calculator,
      'study-timer': Timer,
      'gpa-calculator': Calculator
    }
    return icons[tool] || Activity
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your account data...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'data', label: 'My Data', icon: Archive },
    { id: 'activity', label: 'Recent Activity', icon: Activity },
    { id: 'goals', label: 'Goals & Progress', icon: Target },
    { id: 'settings', label: 'Account Settings', icon: Settings },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
              <p className="text-gray-600">Member since {formatDate(user.joinedAt || new Date().toISOString())}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tools Used</p>
                <p className="text-2xl font-bold text-gray-900">{userData?.toolsUsed.length || 0}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Streak</p>
                <p className="text-2xl font-bold text-gray-900">{userData?.studyStats.studyStreak || 0} days</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Study Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(userData?.studyStats.totalStudyTime || 0)}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saved Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(userData?.flashcards.length || 0) + 
                   (userData?.resumes.length || 0) + 
                   (userData?.notes.length || 0) + 
                   (userData?.dietPlans.length || 0)}
                </p>
              </div>
              <Bookmark className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userData?.recentActivity.length ? (
            <div className="space-y-3">
              {userData.recentActivity.slice(0, 5).map((activity) => {
                const Icon = getToolIcon(activity.tool)
                return (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity to show</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2"
              onClick={() => router.push('/tools/flashcards')}
            >
              <Brain className="w-6 h-6" />
              <span className="text-sm">Flashcards</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2"
              onClick={() => router.push('/tools/resume-builder')}
            >
              <FileText className="w-6 h-6" />
              <span className="text-sm">Resume</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2"
              onClick={() => router.push('/tools/study-timer')}
            >
              <Timer className="w-6 h-6" />
              <span className="text-sm">Study Timer</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col space-y-2"
              onClick={() => router.push('/tools/notes')}
            >
              <Edit3 className="w-6 h-6" />
              <span className="text-sm">Notes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            <Button
              variant="outline"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditingProfile ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full" />
                ) : (
                  <User className="w-12 h-12 text-gray-500" />
                )}
              </div>
              {isEditingProfile && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">Member since {formatDate(user.joinedAt || new Date().toISOString())}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditingProfile}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
              <input
                type="text"
                value={profileForm.university}
                onChange={(e) => setProfileForm(prev => ({ ...prev, university: e.target.value }))}
                disabled={!isEditingProfile}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
              <input
                type="text"
                value={profileForm.major}
                onChange={(e) => setProfileForm(prev => ({ ...prev, major: e.target.value }))}
                disabled={!isEditingProfile}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                value={profileForm.year}
                onChange={(e) => setProfileForm(prev => ({ ...prev, year: e.target.value }))}
                disabled={!isEditingProfile}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={profileForm.bio}
              onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditingProfile}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Tell us about yourself..."
            />
          </div>

          {isEditingProfile && (
            <div className="flex space-x-4">
              <Button onClick={handleSaveProfile}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderDataManagement = () => (
    <div className="space-y-6">
      {/* Flashcards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Flashcards ({userData?.flashcards.length || 0})
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportData('flashcards', userData?.flashcards)}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/tools/flashcards')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userData?.flashcards.length ? (
            <div className="space-y-3">
              {userData.flashcards.map((flashcard) => (
                <div key={flashcard.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{flashcard.title}</h4>
                    <p className="text-sm text-gray-600">
                      {flashcard.cardCount} cards • {flashcard.category}
                    </p>
                    <p className="text-xs text-gray-500">Created {formatDate(flashcard.createdAt)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/tools/flashcards?set=${flashcard.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteData('flashcards', flashcard.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No flashcards created yet</p>
          )}
        </CardContent>
      </Card>

      {/* Resumes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Resumes ({userData?.resumes.length || 0})
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportData('resumes', userData?.resumes)}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/tools/resume-builder')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userData?.resumes.length ? (
            <div className="space-y-3">
              {userData.resumes.map((resume) => (
                <div key={resume.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{resume.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${resume.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{resume.progress}%</span>
                      </div>
                      <p className="text-xs text-gray-500">Modified {formatDate(resume.lastModified)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/tools/resume-builder?id=${resume.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteData('resumes', resume.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No resumes created yet</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Edit3 className="w-5 h-5 mr-2" />
              Notes ({userData?.notes.length || 0})
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportData('notes', userData?.notes)}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/tools/notes')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userData?.notes.length ? (
            <div className="space-y-3">
              {userData.notes.map((note) => (
                <div key={note.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{note.title}</h4>
                    <p className="text-sm text-gray-600">
                      {note.wordCount} words • {note.category}
                    </p>
                    <p className="text-xs text-gray-500">Modified {formatDate(note.lastModified)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/tools/notes?id=${note.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteData('notes', note.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No notes created yet</p>
          )}
        </CardContent>
      </Card>

      {/* Diet Plans */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Diet Plans ({userData?.dietPlans.length || 0})
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportData('dietPlans', userData?.dietPlans)}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/tools/diet-planner')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userData?.dietPlans.length ? (
            <div className="space-y-3">
              {userData.dietPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{plan.title}</h4>
                    <p className="text-sm text-gray-600">
                      {plan.calories} calories • {plan.type}
                    </p>
                    <p className="text-xs text-gray-500">Created {formatDate(plan.createdAt)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/tools/diet-planner?plan=${plan.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteData('dietPlans', plan.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No diet plans created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderActivity = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userData?.recentActivity.length ? (
          <div className="space-y-4">
            {userData.recentActivity.map((activity) => {
              const Icon = getToolIcon(activity.tool)
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.action}</h4>
                    <p className="text-sm text-gray-600 capitalize">{activity.tool}</p>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No activity to show</p>
        )}
      </CardContent>
    </Card>
  )

  const renderGoals = () => (
    <div className="space-y-6">
      {/* Study Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Study Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weekly Study Time Goal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Weekly Study Time</h4>
              <span className="text-sm text-gray-600">
                {formatDuration(userData?.studyStats.totalStudyTime || 0)} / {formatDuration((userData?.goals.studyTimeGoal || 25) * 60)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full" 
                style={{ 
                  width: `${Math.min(100, ((userData?.studyStats.totalStudyTime || 0) / ((userData?.goals.studyTimeGoal || 25) * 60)) * 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Study Streak */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Study Streak</h4>
              <span className="text-sm text-gray-600">{userData?.studyStats.studyStreak || 0} days</span>
            </div>
            <div className="flex space-x-1">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded ${
                    i < (userData?.studyStats.studyStreak || 0) % 7 ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Goals */}
      {userData?.goals.gpaTarget && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Academic Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">GPA Target</h4>
                <span className="text-sm text-gray-600">
                  {userData.goals.currentGPA || 0} / {userData.goals.gpaTarget}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, ((userData.goals.currentGPA || 0) / userData.goals.gpaTarget) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Savings Goals */}
      {userData?.goals.savingsGoal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Savings Goal: {userData.goals.savingsGoal.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Progress</h4>
                <span className="text-sm text-gray-600">
                  ₹{userData.goals.savingsGoal.current} / ₹{userData.goals.savingsGoal.goal}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, (userData.goals.savingsGoal.current / userData.goals.savingsGoal.goal) * 100)}%` 
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {Math.round((userData.goals.savingsGoal.current / userData.goals.savingsGoal.goal) * 100)}% completed
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Email Address</h4>
            <p className="text-gray-600">{user.email}</p>
            <Button variant="outline" size="sm" className="mt-2">
              Change Email
            </Button>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Password</h4>
            <p className="text-gray-600">••••••••</p>
            <Button variant="outline" size="sm" className="mt-2">
              Change Password
            </Button>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Theme</h4>
            <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Preferences</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3" />
                <span className="text-gray-700">Enable notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3" />
                <span className="text-gray-700">Auto-save data</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="mr-3" />
                <span className="text-gray-700">Enable analytics</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-gray-700">Sync across devices</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Archive className="w-5 h-5 mr-2" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleExportData('all', userData)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>

          <Button variant="outline" className="w-full justify-start">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Data
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Delete Account</h4>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPrivacy = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Privacy & Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Profile Visibility</h4>
          <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg">
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Control who can see your profile information
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Data Sharing</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span className="text-gray-700">Share progress with other users</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span className="text-gray-700">Allow anonymous usage analytics</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span className="text-gray-700">Receive personalized recommendations</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-600 mb-4">
            Add an extra layer of security to your account
          </p>
          <Button variant="outline">
            Enable 2FA
          </Button>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Login Sessions</h4>
          <p className="text-sm text-gray-600 mb-4">
            Manage your active login sessions
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Current Session</p>
                <p className="text-sm text-gray-600">Windows • Chrome • Current location</p>
              </div>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'profile':
        return renderProfile()
      case 'data':
        return renderDataManagement()
      case 'activity':
        return renderActivity()
      case 'goals':
        return renderGoals()
      case 'settings':
        return renderSettings()
      case 'privacy':
        return renderPrivacy()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </button>
                    )
                  })}
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you absolutely sure you want to delete your account? This will permanently delete all your data including flashcards, resumes, notes, and other saved content.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
