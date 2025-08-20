'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { 
  User,
  Settings,
  BarChart3,
  Shield,
  HelpCircle,
  Calendar,
  Trophy,
  Clock,
  BookOpen,
  Brain,
  Calculator,
  Timer,
  FileText,
  MapPin,
  Edit3,
  Apple,
  Trash2,
  Eye
} from 'lucide-react'

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [savedDietPlans, setSavedDietPlans] = useState<any[]>([])
  const [showDietPlanModal, setShowDietPlanModal] = useState(false)
  const [selectedDietPlan, setSelectedDietPlan] = useState<any>(null)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    university: user?.university || '',
    major: user?.major || '',
    year: user?.year || ''
  })

  // Handle URL parameters for tab switching
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['profile', 'data', 'statistics', 'privacy', 'settings', 'help'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        university: user.university || '',
        major: user.major || '',
        year: user.year || ''
      })
    }
  }, [user])

  // Load saved diet plans when user changes
  useEffect(() => {
    if (user) {
      try {
        const saved = JSON.parse(localStorage.getItem(`student_tools_${user.id}_dietPlans`) || '[]')
        const userPlans = saved.filter((plan: any) => plan.userId === user.email)
        setSavedDietPlans(userPlans)
      } catch (error) {
        console.error('Error loading saved diet plans:', error)
      }
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please log in to access your profile.</p>
            <Button onClick={() => window.location.href = '/'}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const menuItems = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'data', label: 'My Data & Progress', icon: BarChart3 },
    { id: 'statistics', label: 'Study Statistics', icon: Calendar },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'settings', label: 'App Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ]

  const handleSaveProfile = () => {
    // Update user context with new data
    updateProfile(profileData)
    setIsEditing(false)
  }

  // Diet plan management functions
  const deleteDietPlan = (planIndex: number) => {
    try {
      const allPlans = JSON.parse(localStorage.getItem(`student_tools_${user?.id}_dietPlans`) || '[]')
      const updatedPlans = allPlans.filter((plan: any, index: number) => 
        !(plan.userId === user?.email && savedDietPlans.findIndex(p => p === plan) === planIndex)
      )
      localStorage.setItem(`student_tools_${user?.id}_dietPlans`, JSON.stringify(updatedPlans))
      
      // Update local state
      const updatedSavedPlans = savedDietPlans.filter((_, index) => index !== planIndex)
      setSavedDietPlans(updatedSavedPlans)
    } catch (error) {
      console.error('Error deleting diet plan:', error)
    }
  }

  const viewDietPlan = (plan: any) => {
    setSelectedDietPlan(plan)
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "destructive" : "primary"}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <img
              src={user.avatar}
              alt="Profile"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Joined {new Date(user.joinedAt || new Date()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                University
              </label>
              <input
                type="text"
                value={profileData.university}
                onChange={(e) => setProfileData({...profileData, university: e.target.value})}
                disabled={!isEditing}
                placeholder="Enter your university"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Major
              </label>
              <input
                type="text"
                value={profileData.major}
                onChange={(e) => setProfileData({...profileData, major: e.target.value})}
                disabled={!isEditing}
                placeholder="Enter your major"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <select
                value={profileData.year}
                onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Graduate</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>
          {isEditing && (
            <div className="mt-4 flex space-x-2">
              <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700">
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderDataProgress = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Data & Progress</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mind Maps Created</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Total notes saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcard Sets</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">8 active sets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calculations Done</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">GPA & Scientific calc</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
        
        {/* Diet Plans Card */}
        <div className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowDietPlanModal(true)}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diet Plans Saved</CardTitle>
              <Apple className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savedDietPlans.length}</div>
              <p className="text-xs text-muted-foreground">
                Personalized nutrition plans
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Created mind map: "Physics Chapter 5"</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Timer className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Completed 25-minute study session</p>
                <p className="text-sm text-gray-500">Yesterday</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calculator className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium">Calculated GPA for semester</p>
                <p className="text-sm text-gray-500">3 days ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">Created new note: "Exam prep checklist"</p>
                <p className="text-sm text-gray-500">1 week ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderStatistics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Study Statistics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Monday</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
                <span className="text-sm text-gray-600">2.4h</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tuesday</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                <span className="text-sm text-gray-600">1.8h</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Wednesday</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '90%'}}></div>
                </div>
                <span className="text-sm text-gray-600">2.7h</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Thursday</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '70%'}}></div>
                </div>
                <span className="text-sm text-gray-600">2.1h</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Friday</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
                <span className="text-sm text-gray-600">3.0h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tool Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Mind Map</span>
                  <span className="text-sm">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '35%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Study Timer</span>
                  <span className="text-sm">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '28%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Notes</span>
                  <span className="text-sm">22%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '22%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Calculator</span>
                  <span className="text-sm">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '15%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">Study Streak</p>
                <p className="text-sm text-yellow-600">7 consecutive days</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800">Mind Map Master</p>
                <p className="text-sm text-blue-600">Created 10+ mind maps</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Time Manager</p>
                <p className="text-sm text-green-600">50+ hours studied</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPrivacySecurity = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Privacy & Security</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-gray-600">Last changed 3 months ago</p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Data Export</h4>
              <p className="text-sm text-gray-600">Download all your data</p>
            </div>
            <Button variant="outline">Export Data</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-gray-600">Permanently delete your account and data</p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Analytics</h4>
              <p className="text-sm text-gray-600">Help improve our service with usage data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Marketing Emails</h4>
              <p className="text-sm text-gray-600">Receive updates about new features</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAppSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">App Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Theme</h4>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input type="radio" name="theme" value="light" defaultChecked />
                <span>Light</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="theme" value="dark" />
                <span>Dark</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="theme" value="auto" />
                <span>Auto</span>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Compact Mode</h4>
              <p className="text-sm text-gray-600">Show more content on screen</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Study Reminders</h4>
              <p className="text-sm text-gray-600">Get reminded to take study breaks</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Deadline Alerts</h4>
              <p className="text-sm text-gray-600">Notify about upcoming deadlines</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Default Study Timer Duration</h4>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="25">25 minutes (Pomodoro)</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
          <div>
            <h4 className="font-medium mb-2">Auto-save Frequency</h4>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="30">Every 30 seconds</option>
              <option value="60">Every minute</option>
              <option value="300">Every 5 minutes</option>
              <option value="0">Manual save only</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHelp = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-b pb-4">
            <h4 className="font-medium mb-2">How do I export my mind maps?</h4>
            <p className="text-sm text-gray-600">
              You can export mind maps by clicking the export button in the mind map editor and choosing your preferred format (PNG, PDF, or JSON).
            </p>
          </div>
          <div className="border-b pb-4">
            <h4 className="font-medium mb-2">Can I sync my data across devices?</h4>
            <p className="text-sm text-gray-600">
              Currently, data is stored locally on your device. Cloud sync is coming in a future update.
            </p>
          </div>
          <div className="border-b pb-4">
            <h4 className="font-medium mb-2">How do I use the AI study guide generator?</h4>
            <p className="text-sm text-gray-600">
              Navigate to the AI Study Guide tool, enter your topic or upload content, and the AI will generate a comprehensive study guide for you.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Is my data private and secure?</h4>
            <p className="text-sm text-gray-600">
              Yes, your data is stored locally on your device and is not shared with third parties. You can review our privacy policy for more details.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-12">
              <HelpCircle className="w-5 h-5 mr-2" />
              Open Help Center
            </Button>
            <Button variant="outline" className="h-12">
              Send Feedback
            </Button>
          </div>
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Need immediate help? Email us at{' '}
              <a href="mailto:contact@campustoolshub.com" className="text-blue-600 hover:underline">
                contact@campustoolshub.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Version:</span>
              <span>1.2.0</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>Dec 15, 2024</span>
            </div>
            <div className="flex justify-between">
              <span>Platform:</span>
              <span>Web Application</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings()
      case 'data':
        return renderDataProgress()
      case 'statistics':
        return renderStatistics()
      case 'privacy':
        return renderPrivacySecurity()
      case 'settings':
        return renderAppSettings()
      case 'help':
        return renderHelp()
      default:
        return renderProfileSettings()
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
                    <MapPin className="w-5 h-5 mr-3" />
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

        {/* Diet Plans Modal */}
        {showDietPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">My Diet Plans</h3>
                  <button
                    onClick={() => setShowDietPlanModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-6 w-6" />
                  </button>
                </div>
                
                {savedDietPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Diet Plans Yet</h3>
                    <p className="text-gray-500">Create your first diet plan to see it here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedDietPlans.map((plan, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{plan.title || `Diet Plan ${index + 1}`}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Created: {new Date(plan.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex space-x-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedDietPlan(plan)
                                  setShowDietPlanModal(false)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteDietPlan(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selected Diet Plan Detail Modal */}
        {selectedDietPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{selectedDietPlan.title || 'Diet Plan Details'}</h3>
                  <button
                    onClick={() => setSelectedDietPlan(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Plan Overview */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Plan Overview</h4>
                    <p className="text-green-700">{selectedDietPlan.description}</p>
                  </div>

                  {/* Nutrition Summary */}
                  {selectedDietPlan.nutrition && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedDietPlan.nutrition.calories}</div>
                        <div className="text-sm text-blue-700">Calories</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedDietPlan.nutrition.protein}g</div>
                        <div className="text-sm text-green-700">Protein</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-600">{selectedDietPlan.nutrition.carbs}g</div>
                        <div className="text-sm text-yellow-700">Carbs</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600">{selectedDietPlan.nutrition.fats}g</div>
                        <div className="text-sm text-red-700">Fats</div>
                      </div>
                    </div>
                  )}

                  {/* Meal Plans */}
                  {selectedDietPlan.meals && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Daily Meal Plan</h4>
                      {Object.entries(selectedDietPlan.meals).map(([mealType, meal]: [string, any]) => (
                        <div key={mealType} className="border rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2 capitalize">{mealType}</h5>
                          <p className="text-gray-700">{meal.description || meal}</p>
                          {meal.calories && (
                            <p className="text-sm text-gray-500 mt-1">{meal.calories} calories</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
