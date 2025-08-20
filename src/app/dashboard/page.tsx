'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Calculator, 
  BookOpen, 
  Clock, 
  FileText, 
  TrendingUp,
  Target,
  Award,
  Calendar,
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Zap,
  ExternalLink
} from 'lucide-react'

const Dashboard = () => {
  const [recentTools] = useState([
    { name: 'Citation Generator', href: '/tools/citation-generator', lastUsed: '2 hours ago', icon: FileText },
    { name: 'GPA Calculator', href: '/tools/gpa-calculator', lastUsed: '5 hours ago', icon: Calculator },
    { name: 'Study Timer', href: '/tools/study-timer', lastUsed: '1 day ago', icon: Clock },
    { name: 'Flashcards', href: '/tools/flashcards', lastUsed: '2 days ago', icon: BookOpen },
  ])

  const [stats] = useState({
    totalSessions: 24,
    studyHours: 45.5,
    gpaCalculations: 8,
    toolsUsed: 6
  })

  const [goals] = useState([
    { title: 'Complete 30 study sessions this month', progress: 80, current: 24, target: 30 },
    { title: 'Maintain GPA above 3.5', progress: 95, current: 3.7, target: 3.5 },
    { title: 'Use all available tools', progress: 75, current: 6, target: 8 },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-secondary-600 hover:text-primary-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Your Dashboard
            </h1>
            <p className="text-lg text-secondary-600">
              Track your progress and access your most-used tools
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="card text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">{stats.totalSessions}</div>
                <div className="text-sm text-secondary-600">Study Sessions</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.studyHours}h</div>
                <div className="text-sm text-secondary-600">Study Hours</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.gpaCalculations}</div>
                <div className="text-sm text-secondary-600">GPA Checks</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.toolsUsed}</div>
                <div className="text-sm text-secondary-600">Tools Used</div>
              </div>
            </motion.div>

            {/* Recent Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900">Recent Tools</h2>
                <Link href="/tools" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentTools.map((tool, index) => {
                  const Icon = tool.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    >
                      <Link
                        href={tool.href}
                        className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-lg">
                            <Icon className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-secondary-900 group-hover:text-primary-600">
                              {tool.name}
                            </div>
                            <div className="text-sm text-secondary-600">Last used {tool.lastUsed}</div>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-secondary-400 group-hover:text-primary-600" />
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Goals Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900">Goals & Progress</h2>
                <button className="btn-secondary text-sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Goal
                </button>
              </div>
              <div className="space-y-6">
                {goals.map((goal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-secondary-900">{goal.title}</div>
                      <div className="text-sm text-secondary-600">
                        {goal.current} / {goal.target}
                      </div>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-secondary-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link 
                  href="/tools/study-timer" 
                  className="block w-full btn-primary text-center"
                >
                  Start Study Session
                </Link>
                <Link 
                  href="/tools/gpa-calculator" 
                  className="block w-full btn-secondary text-center"
                >
                  Calculate GPA
                </Link>
                <Link 
                  href="/tools/citation-generator" 
                  className="block w-full btn-secondary text-center"
                >
                  Generate Citation
                </Link>
                <Link 
                  href="/tools/flashcards" 
                  className="block w-full btn-secondary text-center"
                >
                  Review Flashcards
                </Link>
              </div>
            </motion.div>

            {/* Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-secondary-900 mb-6">Today's Schedule</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <div>
                    <div className="font-medium text-secondary-900">Mathematics</div>
                    <div className="text-sm text-secondary-600">9:00 AM - 10:30 AM</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div>
                    <div className="font-medium text-secondary-900">Physics Lab</div>
                    <div className="text-sm text-secondary-600">2:00 PM - 4:00 PM</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <div className="font-medium text-secondary-900">Study Session</div>
                    <div className="text-sm text-secondary-600">7:00 PM - 8:30 PM</div>
                  </div>
                </div>
              </div>
              <Link 
                href="/tools/timetable" 
                className="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium mt-4"
              >
                Manage Schedule
              </Link>
            </motion.div>

            {/* Tips & Motivation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card"
            >
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">💡 Today's Tip</h2>
              <p className="text-secondary-600 text-sm leading-relaxed">
                Use the Pomodoro Technique to maintain focus during study sessions. 
                Work for 25 minutes, then take a 5-minute break. This helps prevent burnout and improves retention.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
