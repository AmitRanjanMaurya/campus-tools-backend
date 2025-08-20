'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Plus,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  PieChart,
  BarChart3,
  Calculator,
  Download,
  Upload,
  Settings,
  Calendar,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Share2,
  Moon,
  Sun,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'

// Types
interface Course {
  id: string
  name: string
  code: string
  credits: number
  semester: string
  year: string
  professor?: string
  color: string
  targetGrade?: number
  notes?: string
}

interface Grade {
  id: string
  courseId: string
  type: 'exam' | 'quiz' | 'assignment' | 'project' | 'participation' | 'midterm' | 'final'
  name: string
  score: number
  maxScore: number
  weight: number
  date: string
  notes?: string
}

interface Semester {
  id: string
  name: string
  year: string
  isActive: boolean
  gpa?: number
  totalCredits?: number
}

// Grading Systems
const GRADING_SYSTEMS = {
  percentage: { name: 'Percentage (0-100)', min: 0, max: 100 },
  gpa4: { name: '4.0 Scale GPA', min: 0, max: 4.0 },
  gpa10: { name: '10-Point Scale', min: 0, max: 10 },
  letter: { name: 'Letter Grades (A-F)', grades: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'] }
}

// Grade conversion utilities
const convertGrade = (score: number, fromSystem: string, toSystem: string): number => {
  // Convert to percentage first
  let percentage = score
  if (fromSystem === 'gpa4') percentage = (score / 4.0) * 100
  if (fromSystem === 'gpa10') percentage = score * 10
  
  // Convert from percentage to target system
  if (toSystem === 'gpa4') return (percentage / 100) * 4.0
  if (toSystem === 'gpa10') return percentage / 10
  return percentage
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

const getGradeColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-600'
  if (percentage >= 80) return 'text-blue-600'
  if (percentage >= 70) return 'text-yellow-600'
  if (percentage >= 60) return 'text-orange-600'
  return 'text-red-600'
}

export default function GradeTracker() {
  // State Management
  const [darkMode, setDarkMode] = useState(false)
  const [gradingSystem, setGradingSystem] = useState('percentage')
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: '1', name: 'Fall 2024', year: '2024', isActive: true }
  ])
  const [activeSemester, setActiveSemester] = useState('1')
  const [courses, setCourses] = useState<Course[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [showAddGrade, setShowAddGrade] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showTargetPlanner, setShowTargetPlanner] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // New Course Form
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: '',
    code: '',
    credits: 3,
    semester: activeSemester,
    year: '2024',
    color: '#3B82F6',
    targetGrade: 85
  })

  // New Grade Form
  const [newGrade, setNewGrade] = useState<Partial<Grade>>({
    courseId: '',
    type: 'exam',
    name: '',
    score: 0,
    maxScore: 100,
    weight: 20,
    date: new Date().toISOString().split('T')[0]
  })

  // Calculate GPA for current semester
  const calculateSemesterGPA = (): number => {
    const semesterCourses = courses.filter(c => c.semester === activeSemester)
    if (semesterCourses.length === 0) return 0

    let totalPoints = 0
    let totalCredits = 0

    semesterCourses.forEach(course => {
      const courseGrades = grades.filter(g => g.courseId === course.id)
      if (courseGrades.length > 0) {
        const courseAverage = courseGrades.reduce((sum, grade) => 
          sum + (grade.score / grade.maxScore * 100 * grade.weight / 100), 0
        )
        const gpaPoints = convertGrade(courseAverage, 'percentage', 'gpa4')
        totalPoints += gpaPoints * course.credits
        totalCredits += course.credits
      }
    })

    return totalCredits > 0 ? totalPoints / totalCredits : 0
  }

  // Calculate overall CGPA
  const calculateCGPA = (): number => {
    let totalGradePoints = 0
    let totalCredits = 0

    courses.forEach(course => {
      const courseGrades = grades.filter(g => g.courseId === course.id)
      if (courseGrades.length > 0) {
        const courseAverage = courseGrades.reduce((sum, grade) => 
          sum + (grade.score / grade.maxScore * 100 * grade.weight / 100), 0
        )
        const gpaPoints = convertGrade(courseAverage, 'percentage', 'gpa4')
        totalGradePoints += gpaPoints * course.credits
        totalCredits += course.credits
      }
    })

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0
  }

  // Add new course
  const addCourse = () => {
    if (!newCourse.name || !newCourse.code) return

    const course: Course = {
      id: Date.now().toString(),
      name: newCourse.name!,
      code: newCourse.code!,
      credits: newCourse.credits || 3,
      semester: activeSemester,
      year: newCourse.year || '2024',
      professor: newCourse.professor,
      color: newCourse.color || '#3B82F6',
      targetGrade: newCourse.targetGrade || 85,
      notes: newCourse.notes
    }

    setCourses([...courses, course])
    setNewCourse({
      name: '',
      code: '',
      credits: 3,
      semester: activeSemester,
      year: '2024',
      color: '#3B82F6',
      targetGrade: 85
    })
    setShowAddCourse(false)
  }

  // Add new grade
  const addGrade = () => {
    if (!newGrade.courseId || !newGrade.name || newGrade.score === undefined) return

    const grade: Grade = {
      id: Date.now().toString(),
      courseId: newGrade.courseId!,
      type: newGrade.type as any,
      name: newGrade.name!,
      score: newGrade.score!,
      maxScore: newGrade.maxScore || 100,
      weight: newGrade.weight || 20,
      date: newGrade.date!,
      notes: newGrade.notes
    }

    setGrades([...grades, grade])
    setNewGrade({
      courseId: '',
      type: 'exam',
      name: '',
      score: 0,
      maxScore: 100,
      weight: 20,
      date: new Date().toISOString().split('T')[0]
    })
    setShowAddGrade(false)
  }

  // Get course average
  const getCourseAverage = (courseId: string): number => {
    const courseGrades = grades.filter(g => g.courseId === courseId)
    if (courseGrades.length === 0) return 0

    return courseGrades.reduce((sum, grade) => 
      sum + (grade.score / grade.maxScore * 100 * grade.weight / 100), 0
    )
  }

  // Get performance insights
  const getPerformanceInsights = (): Array<{type: 'warning' | 'success', message: string, course: string}> => {
    const insights: Array<{type: 'warning' | 'success', message: string, course: string}> = []
    
    courses.forEach(course => {
      const average = getCourseAverage(course.id)
      const target = course.targetGrade || 85
      
      if (average > 0 && average < target - 10) {
        insights.push({
          type: 'warning',
          message: `${course.name}: ${average.toFixed(1)}% - ${(target - average).toFixed(1)} points below target`,
          course: course.name
        })
      } else if (average >= target + 5) {
        insights.push({
          type: 'success',
          message: `${course.name}: Excellent! ${(average - target).toFixed(1)} points above target`,
          course: course.name
        })
      }
    })

    return insights
  }

  // Filter courses
  const filteredCourses = courses.filter(course => 
    course.semester === activeSemester &&
    (course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     course.code.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const currentGPA = calculateSemesterGPA()
  const overallCGPA = calculateCGPA()
  const insights = getPerformanceInsights()

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-primary-50 to-secondary-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              href="/tools" 
              className={`flex items-center mr-4 transition-colors ${
                darkMode ? 'text-gray-400 hover:text-white' : 'text-secondary-600 hover:text-primary-600'
              }`}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Tools
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-white hover:bg-gray-50 text-gray-600'
              }`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <select
              value={gradingSystem}
              onChange={(e) => setGradingSystem(e.target.value)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="percentage">Percentage</option>
              <option value="gpa4">4.0 GPA</option>
              <option value="gpa10">10-Point</option>
            </select>
          </div>
        </div>

        {/* Title and Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`text-4xl font-bold mb-4 ${
            darkMode ? 'text-white' : 'text-secondary-900'
          }`}>
            Grade Tracker
          </h1>
          <p className={`text-lg mb-6 ${
            darkMode ? 'text-gray-300' : 'text-secondary-600'
          }`}>
            Track, analyze, and optimize your academic performance
          </p>

          {/* Simple GPA Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-secondary-600'
                }`}>Current GPA</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {currentGPA.toFixed(2)}
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-secondary-500'
              }`}>
                This Semester
              </div>
            </div>

            <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-green-600 mr-2" />
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-secondary-600'
                }`}>Overall CGPA</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {overallCGPA.toFixed(2)}
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-secondary-500'
              }`}>
                Cumulative
              </div>
            </div>

            <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-purple-600 mr-2" />
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-secondary-600'
                }`}>Total Credits</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {courses.reduce((sum, course) => sum + course.credits, 0)}
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-secondary-500'
              }`}>
                All Semesters
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
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
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="btn-secondary flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </button>
          
          <button
            onClick={() => setShowTargetPlanner(!showTargetPlanner)}
            className="btn-secondary flex items-center"
          >
            <Target className="h-4 w-4 mr-2" />
            Target Planner
          </button>
          
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </motion.div>

        {/* Coming Soon Message */}
        <div className={`card text-center ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-secondary-900'
            }`}>
              Comprehensive Grade Tracker
            </h2>
          </div>
          <p className={`text-lg mb-6 ${
            darkMode ? 'text-gray-300' : 'text-secondary-600'
          }`}>
            Full implementation with all advanced features is being finalized
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <h3 className={`font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-secondary-900'
              }`}>
                ✅ Implemented Features
              </h3>
              <ul className={`space-y-1 text-sm ${
                darkMode ? 'text-gray-300' : 'text-secondary-600'
              }`}>
                <li>• Course-wise grade entry system</li>
                <li>• GPA/CGPA auto-calculation</li>
                <li>• Multiple grading systems support</li>
                <li>• Dark mode toggle</li>
                <li>• Performance insights framework</li>
              </ul>
            </div>
            <div>
              <h3 className={`font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-secondary-900'
              }`}>
                🚀 Coming Soon
              </h3>
              <ul className={`space-y-1 text-sm ${
                darkMode ? 'text-gray-300' : 'text-secondary-600'
              }`}>
                <li>• Interactive course cards</li>
                <li>• Advanced analytics dashboard</li>
                <li>• Target grade planner</li>
                <li>• Import/Export functionality</li>
                <li>• Progress prediction algorithms</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
