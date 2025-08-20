'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { useGradeTrackerData } from '@/hooks/useUserData'
import AuthModal from '@/components/auth/AuthModal'
import { ArrowLeft, Plus, BookOpen, TrendingUp, Award, X, Search, BarChart3, PieChart, LineChart, HelpCircle, Target, Calculator, Lock, User } from 'lucide-react'

interface Course {
  id: string
  name: string
  code: string
  credits: number
  color: string
  targetGrade: number
}

interface Grade {
  id: string
  courseId: string
  name: string
  score: number
  maxScore: number
  weight: number
}

export default function GradeTracker() {
  const { user } = useAuth()
  const { data: userData, saveData, isLoading: dataLoading } = useGradeTrackerData()
  
  const [courses, setCourses] = useState<Course[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [showAddGrade, setShowAddGrade] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showHowToUse, setShowHowToUse] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Load data when component mounts or user changes
  useEffect(() => {
    if (!dataLoading && userData) {
      setCourses(userData.courses || [])
      setGrades(userData.grades || [])
    }
  }, [userData, dataLoading])

  // Save data whenever courses or grades change
  useEffect(() => {
    if (!dataLoading) {
      saveData({ courses, grades })
    }
  }, [courses, grades, saveData, dataLoading])

  // Data migration for existing users (migrate guest data to authenticated data)
  useEffect(() => {
    if (user && courses.length === 0 && grades.length === 0) {
      const guestCourses = localStorage.getItem('student_tools_guest_grade_tracker')
      if (guestCourses) {
        try {
          const guestData = JSON.parse(guestCourses)
          if (guestData.courses?.length > 0 || guestData.grades?.length > 0) {
            setCourses(guestData.courses || [])
            setGrades(guestData.grades || [])
            // Clean up guest data
            localStorage.removeItem('student_tools_guest_grade_tracker')
          }
        } catch (error) {
          console.error('Error migrating guest data:', error)
        }
      }
    }
  }, [user, courses.length, grades.length])

  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    credits: 3,
    color: '#3B82F6',
    targetGrade: 85
  })

  const [newGrade, setNewGrade] = useState({
    courseId: '',
    name: '',
    score: 0,
    maxScore: 100,
    weight: 20
  })

  const calculateGPA = (): number => {
    if (courses.length === 0) return 0
    
    let totalPoints = 0
    let totalCredits = 0

    courses.forEach(course => {
      const courseGrades = grades.filter(g => g.courseId === course.id)
      if (courseGrades.length > 0) {
        const courseAverage = courseGrades.reduce((sum, grade) => 
          sum + (grade.score / grade.maxScore * 100 * grade.weight / 100), 0
        )
        const gpaPoints = (courseAverage / 100) * 4.0
        totalPoints += gpaPoints * course.credits
        totalCredits += course.credits
      }
    })

    return totalCredits > 0 ? totalPoints / totalCredits : 0
  }

  const getCourseAverage = (courseId: string): number => {
    const courseGrades = grades.filter(g => g.courseId === courseId)
    if (courseGrades.length === 0) return 0

    return courseGrades.reduce((sum, grade) => 
      sum + (grade.score / grade.maxScore * 100 * grade.weight / 100), 0
    )
  }

  const addCourse = () => {
    if (!newCourse.name || !newCourse.code) return

    const course: Course = {
      id: Date.now().toString(),
      ...newCourse
    }

    setCourses([...courses, course])
    setNewCourse({
      name: '',
      code: '',
      credits: 3,
      color: '#3B82F6',
      targetGrade: 85
    })
    setShowAddCourse(false)
  }

  const addGrade = () => {
    if (!newGrade.courseId || !newGrade.name) return

    const grade: Grade = {
      id: Date.now().toString(),
      ...newGrade
    }

    setGrades([...grades, grade])
    setNewGrade({
      courseId: '',
      name: '',
      score: 0,
      maxScore: 100,
      weight: 20
    })
    setShowAddGrade(false)
  }

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 97) return 'A+'
    if (percentage >= 93) return 'A'
    if (percentage >= 90) return 'A-'
    if (percentage >= 87) return 'B+'
    if (percentage >= 83) return 'B'
    if (percentage >= 80) return 'B-'
    if (percentage >= 77) return 'C+'
    if (percentage >= 73) return 'C'
    if (percentage >= 70) return 'C-'
    if (percentage >= 67) return 'D+'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentGPA = calculateGPA()
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)

  // Analytics data for visualizations
  const getGradeDistribution = () => {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    courses.forEach(course => {
      const avg = getCourseAverage(course.id)
      if (avg >= 90) distribution.A += 1
      else if (avg >= 80) distribution.B += 1
      else if (avg >= 70) distribution.C += 1
      else if (avg >= 60) distribution.D += 1
      else distribution.F += 1
    })
    return distribution
  }

  const getCreditDistribution = () => {
    return courses.map(course => ({
      name: course.code,
      credits: course.credits,
      color: course.color,
      average: getCourseAverage(course.id)
    }))
  }

  const getPerformanceTrend = () => {
    return courses.map(course => ({
      name: course.code,
      target: course.targetGrade,
      current: getCourseAverage(course.id),
      difference: getCourseAverage(course.id) - course.targetGrade
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/tools" 
            className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tools
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-secondary-900">
            Grade Tracker
          </h1>
          <p className="text-lg mb-6 text-secondary-600">
            Track, analyze, and optimize your academic performance
          </p>
          
          {/* Authentication Status */}
          {user ? (
            <div className="inline-flex items-center bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <User className="h-4 w-4 mr-2" />
              Welcome back, {user.name}! Your data is automatically saved.
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-amber-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-900">Save Your Progress</h3>
                  <p className="text-amber-700">Sign in to automatically save your grades and track your academic progress.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Sign In to Save Data
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-secondary-600">Current GPA</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {currentGPA.toFixed(2)}
            </div>
            <div className="text-sm text-secondary-500">
              4.0 Scale
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-6 w-6 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-secondary-600">Total Credits</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {totalCredits}
            </div>
            <div className="text-sm text-secondary-500">
              Credit Hours
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-sm font-medium text-secondary-600">Courses</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {courses.length}
            </div>
            <div className="text-sm text-secondary-500">
              Active
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={() => setShowAddCourse(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </button>
          
          <button
            onClick={() => setShowAddGrade(true)}
            className="btn-secondary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Grade
          </button>

          <button
            onClick={() => setShowAnalytics(true)}
            className="btn-secondary flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </button>

          <button
            onClick={() => setShowHowToUse(true)}
            className="btn-secondary flex items-center"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            How to Use
          </button>
        </div>

        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCourses.map((course) => {
            const average = getCourseAverage(course.id)
            const courseGrades = grades.filter(g => g.courseId === course.id)
            
            return (
              <div
                key={course.id}
                className="card hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: course.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-secondary-900">
                        {course.name}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        {course.code} • {course.credits} credits
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-secondary-700">
                      Current Average
                    </span>
                    <div className="flex items-center">
                      <span className={`text-lg font-bold mr-2 ${getGradeColor(average)}`}>
                        {average > 0 ? `${average.toFixed(1)}%` : 'No grades'}
                      </span>
                      {average > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {getLetterGrade(average)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600">
                      Target: {course.targetGrade}%
                    </span>
                    <span className="text-sm text-secondary-600">
                      {courseGrades.length} grades
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((average / 100) * 100, 100)}%`,
                        backgroundColor: average >= course.targetGrade ? '#10B981' : '#F59E0B'
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {courses.length === 0 && (
          <div className="card text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-secondary-900">
              No courses yet
            </h3>
            <p className="text-sm mb-4 text-secondary-600">
              Add your first course to start tracking your grades
            </p>
            <button
              onClick={() => setShowAddCourse(true)}
              className="btn-primary"
            >
              Add Course
            </button>
          </div>
        )}

        {showAddCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Add New Course
                </h3>
                <button
                  onClick={() => setShowAddCourse(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-secondary-700">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 transition-colors"
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-secondary-700">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={newCourse.code}
                    onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 transition-colors"
                    placeholder="e.g., CS101"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-secondary-700">
                      Credits
                    </label>
                    <input
                      type="number"
                      value={newCourse.credits}
                      onChange={(e) => setNewCourse({...newCourse, credits: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 transition-colors"
                      min="1"
                      max="6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-secondary-700">
                      Target Grade
                    </label>
                    <input
                      type="number"
                      value={newCourse.targetGrade}
                      onChange={(e) => setNewCourse({...newCourse, targetGrade: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 transition-colors"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-secondary-700">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                      <button
                        key={color}
                        onClick={() => setNewCourse({...newCourse, color})}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          newCourse.color === color ? 'border-gray-400 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={addCourse}
                    className="flex-1 btn-primary"
                  >
                    Add Course
                  </button>
                  <button
                    onClick={() => setShowAddCourse(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddGrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Add New Grade
                </h3>
                <button
                  onClick={() => setShowAddGrade(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-secondary-700">
                    Course
                  </label>
                  <select
                    value={newGrade.courseId}
                    onChange={(e) => setNewGrade({...newGrade, courseId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 transition-colors"
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-secondary-700">
                    Assessment Name
                  </label>
                  <input
                    type="text"
                    value={newGrade.name}
                    onChange={(e) => setNewGrade({...newGrade, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 transition-colors"
                    placeholder="e.g., Midterm Exam"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-secondary-700">
                      Score
                    </label>
                    <input
                      type="number"
                      value={newGrade.score}
                      onChange={(e) => setNewGrade({...newGrade, score: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 transition-colors"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-secondary-700">
                      Max Score
                    </label>
                    <input
                      type="number"
                      value={newGrade.maxScore}
                      onChange={(e) => setNewGrade({...newGrade, maxScore: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 transition-colors"
                      min="1"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-secondary-700">
                    Weight (%)
                  </label>
                  <input
                    type="number"
                    value={newGrade.weight}
                    onChange={(e) => setNewGrade({...newGrade, weight: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 transition-colors"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={addGrade}
                    className="flex-1 btn-primary"
                  >
                    Add Grade
                  </button>
                  <button
                    onClick={() => setShowAddGrade(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-4xl w-full bg-white rounded-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-secondary-900">
                  Academic Analytics
                </h3>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Grade Distribution Chart */}
                  <div className="card">
                    <div className="flex items-center mb-4">
                      <PieChart className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="text-lg font-semibold text-secondary-900">Grade Distribution</h4>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(getGradeDistribution()).map(([grade, count]) => (
                        <div key={grade} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded mr-3 ${
                              grade === 'A' ? 'bg-green-500' :
                              grade === 'B' ? 'bg-blue-500' :
                              grade === 'C' ? 'bg-yellow-500' :
                              grade === 'D' ? 'bg-orange-500' : 'bg-red-500'
                            }`} />
                            <span className="font-medium">Grade {grade}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-3">{count} courses</span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div 
                                className={`h-2 rounded-full ${
                                  grade === 'A' ? 'bg-green-500' :
                                  grade === 'B' ? 'bg-blue-500' :
                                  grade === 'C' ? 'bg-yellow-500' :
                                  grade === 'D' ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${courses.length > 0 ? (count / courses.length) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance vs Target Chart */}
                  <div className="card">
                    <div className="flex items-center mb-4">
                      <Target className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="text-lg font-semibold text-secondary-900">Performance vs Target</h4>
                    </div>
                    <div className="space-y-3">
                      {getPerformanceTrend().map((course, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">{course.name}</span>
                            <span className={`text-sm font-medium ${
                              course.difference >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {course.difference >= 0 ? '+' : ''}{course.difference.toFixed(1)}%
                            </span>
                          </div>
                          <div className="relative">
                            <div className="w-full h-3 bg-gray-200 rounded-full">
                              <div 
                                className="h-3 rounded-full bg-blue-500"
                                style={{ width: `${Math.min((course.current / 100) * 100, 100)}%` }}
                              />
                            </div>
                            <div 
                              className="absolute top-0 w-1 h-3 bg-red-500"
                              style={{ left: `${course.target}%` }}
                              title={`Target: ${course.target}%`}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Current: {course.current.toFixed(1)}%</span>
                            <span>Target: {course.target}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Credit Distribution */}
                  <div className="card">
                    <div className="flex items-center mb-4">
                      <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                      <h4 className="text-lg font-semibold text-secondary-900">Credit Distribution</h4>
                    </div>
                    <div className="space-y-3">
                      {getCreditDistribution().map((course, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded mr-3"
                              style={{ backgroundColor: course.color }}
                            />
                            <span className="font-medium text-sm">{course.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-3">{course.credits} credits</span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${(course.credits / Math.max(...courses.map(c => c.credits))) * 100}%`,
                                  backgroundColor: course.color
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GPA Calculator */}
                  <div className="card">
                    <div className="flex items-center mb-4">
                      <Calculator className="h-5 w-5 text-indigo-600 mr-2" />
                      <h4 className="text-lg font-semibold text-secondary-900">GPA Breakdown</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{currentGPA.toFixed(2)}</div>
                          <div className="text-sm text-blue-600">Current GPA</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{totalCredits}</div>
                          <div className="text-sm text-purple-600">Total Credits</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Courses with grades:</span>
                          <span>{courses.filter(c => getCourseAverage(c.id) > 0).length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total assessments:</span>
                          <span>{grades.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Average grade:</span>
                          <span className={getGradeColor(currentGPA * 25)}>
                            {(currentGPA * 25).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h4>
                  <p className="text-gray-500">Add some courses and grades to see analytics.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How to Use Modal */}
        {showHowToUse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-3xl w-full bg-white rounded-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-secondary-900">
                  How to Use Grade Tracker
                </h3>
                <button
                  onClick={() => setShowHowToUse(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="card">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                      1
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-secondary-900 mb-2">Add Your Courses</h4>
                      <p className="text-gray-600 mb-3">
                        Start by adding all your courses for the current semester. Click the "Add Course" button and fill in:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li><strong>Course Name:</strong> Full name of the course (e.g., "Introduction to Computer Science")</li>
                        <li><strong>Course Code:</strong> Course identifier (e.g., "CS101")</li>
                        <li><strong>Credits:</strong> Number of credit hours (typically 1-6)</li>
                        <li><strong>Target Grade:</strong> Your desired grade percentage for this course</li>
                        <li><strong>Color:</strong> Choose a color to easily identify the course in visualizations</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                      2
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-secondary-900 mb-2">Add Your Grades</h4>
                      <p className="text-gray-600 mb-3">
                        For each course, add individual assessments and their grades. Click "Add Grade" and enter:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li><strong>Course:</strong> Select which course this grade belongs to</li>
                        <li><strong>Assessment Name:</strong> What was graded (e.g., "Midterm Exam", "Project 1")</li>
                        <li><strong>Score:</strong> Points you received</li>
                        <li><strong>Max Score:</strong> Total points possible</li>
                        <li><strong>Weight:</strong> How much this assessment counts toward your final grade (%)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                      3
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-secondary-900 mb-2">Track Your Progress</h4>
                      <p className="text-gray-600 mb-3">
                        Monitor your academic performance with various features:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li><strong>Dashboard:</strong> View your current GPA, total credits, and number of courses</li>
                        <li><strong>Course Cards:</strong> See individual course averages, progress toward targets, and grade counts</li>
                        <li><strong>Search:</strong> Find specific courses quickly using the search bar</li>
                        <li><strong>Progress Bars:</strong> Visual indicators showing how close you are to your target grades</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                      4
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-secondary-900 mb-2">Analyze Your Data</h4>
                      <p className="text-gray-600 mb-3">
                        Use the Analytics feature to gain deeper insights:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li><strong>Grade Distribution:</strong> See how many courses fall into each letter grade category</li>
                        <li><strong>Performance vs Target:</strong> Compare your current performance to your target goals</li>
                        <li><strong>Credit Distribution:</strong> Visualize how credits are distributed across courses</li>
                        <li><strong>GPA Breakdown:</strong> Detailed statistics about your academic performance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="card bg-blue-50">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">📝 Tips for Success</h4>
                  <ul className="list-disc list-inside text-sm text-blue-800 space-y-2">
                    <li>Update your grades regularly after each assignment or exam</li>
                    <li>Set realistic target grades based on your goals and course difficulty</li>
                    <li>Use the weight system accurately - check your syllabus for exact percentages</li>
                    <li>Review analytics regularly to identify courses that need more attention</li>
                    <li>Use different colors for different subjects to stay organized</li>
                  </ul>
                </div>

                <div className="card bg-green-50">
                  <h4 className="text-lg font-semibold text-green-900 mb-3">🎯 Understanding Your GPA</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-semibold text-green-800 mb-2">Letter Grade Scale:</h5>
                      <ul className="space-y-1 text-green-700">
                        <li>A+: 97-100% (4.0)</li>
                        <li>A: 93-96% (4.0)</li>
                        <li>A-: 90-92% (3.7)</li>
                        <li>B+: 87-89% (3.3)</li>
                        <li>B: 83-86% (3.0)</li>
                        <li>B-: 80-82% (2.7)</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-green-800 mb-2">GPA Calculation:</h5>
                      <p className="text-green-700 mb-2">
                        Your GPA is calculated by taking the average of all course grades, 
                        weighted by the number of credits for each course.
                      </p>
                      <p className="text-green-700 text-xs">
                        Formula: Σ(Grade Points × Credits) ÷ Total Credits
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal for guests */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
        />

      </div>
    </div>
  )
}
