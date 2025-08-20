'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react'

interface Course {
  id: string
  name: string
  grade: string
  credits: number
}

const GPACalculator = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: '', grade: '', credits: 3 }
  ])
  const [gradeSystem, setGradeSystem] = useState<'4point' | '10point' | 'percentage'>('4point')

  const gradePoints = {
    '4point': {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    },
    '10point': {
      'A+': 10, 'A': 9, 'A-': 8,
      'B+': 7, 'B': 6, 'B-': 5,
      'C+': 4, 'C': 3, 'D': 2, 'F': 0
    },
    'percentage': {} // Will be calculated differently
  }

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: '',
      grade: '',
      credits: 3
    }
    setCourses([...courses, newCourse])
  }

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id))
  }

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ))
  }

  const calculateGPA = () => {
    let totalPoints = 0
    let totalCredits = 0

    courses.forEach(course => {
      if (course.grade && course.credits > 0) {
        let points = 0
        
        if (gradeSystem === 'percentage') {
          const percentage = parseFloat(course.grade)
          if (percentage >= 90) points = 4.0
          else if (percentage >= 80) points = 3.0
          else if (percentage >= 70) points = 2.0
          else if (percentage >= 60) points = 1.0
          else points = 0
        } else {
          points = gradePoints[gradeSystem][course.grade as keyof typeof gradePoints[typeof gradeSystem]] || 0
        }
        
        totalPoints += points * course.credits
        totalCredits += course.credits
      }
    })

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00'
  }

  const getGradeOptions = () => {
    if (gradeSystem === 'percentage') {
      return []
    }
    return Object.keys(gradePoints[gradeSystem])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/tools" className="flex items-center text-secondary-600 hover:text-primary-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tools
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            GPA Calculator
          </h1>
          <p className="text-lg text-secondary-600">
            Calculate your Grade Point Average with support for different grading systems
          </p>
        </div>

        <div className="card max-w-4xl mx-auto">
          {/* Grade System Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Grading System
            </label>
            <div className="flex space-x-4">
              {[
                { value: '4point', label: '4.0 Scale' },
                { value: '10point', label: '10 Point Scale' },
                { value: 'percentage', label: 'Percentage' }
              ].map((system) => (
                <button
                  key={system.value}
                  onClick={() => setGradeSystem(system.value as any)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    gradeSystem === system.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {system.label}
                </button>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900">Courses</h3>
              <button
                onClick={addCourse}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </button>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2">
              <div className="col-span-4">
                <span className="text-sm font-medium text-secondary-600">Course Name</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm font-medium text-secondary-600">Grade</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm font-medium text-secondary-600">Credits</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-medium text-secondary-600">Action</span>
              </div>
            </div>

            {courses.map((course, index) => (
              <div key={course.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-white border border-secondary-200 rounded-lg shadow-sm">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    placeholder={`Course ${index + 1}`}
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    className="input-field text-secondary-900"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Grade
                  </label>
                  {gradeSystem === 'percentage' ? (
                    <input
                      type="number"
                      placeholder="85"
                      min="0"
                      max="100"
                      value={course.grade}
                      onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                      className="input-field text-secondary-900"
                    />
                  ) : (
                    <select
                      value={course.grade}
                      onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                      className="input-field text-secondary-900"
                    >
                      <option value="" className="text-secondary-400">Select Grade</option>
                      {getGradeOptions().map(grade => (
                        <option key={grade} value={grade} className="text-secondary-900">{grade}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="6"
                    step="0.5"
                    value={course.credits}
                    onChange={(e) => updateCourse(course.id, 'credits', parseFloat(e.target.value))}
                    className="input-field text-secondary-900"
                  />
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => removeCourse(course.id)}
                    disabled={courses.length === 1}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="border-t pt-6">
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    Your GPA
                  </h3>
                  <p className="text-secondary-600">
                    Based on {courses.filter(c => c.grade && c.credits > 0).length} courses
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-primary-600 mb-2">
                    {calculateGPA()}
                  </div>
                  <div className="text-sm font-medium text-secondary-600">
                    {gradeSystem === '4point' ? '/ 4.0' : gradeSystem === '10point' ? '/ 10' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">How to Use</h3>
          <ul className="space-y-2 text-secondary-600">
            <li>• Select your grading system (4.0 scale, 10-point scale, or percentage)</li>
            <li>• Add your courses with their respective grades and credit hours</li>
            <li>• Your GPA will be calculated automatically as you input data</li>
            <li>• Use the "Add Course" button to include more courses</li>
            <li>• Remove courses using the trash icon if needed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default GPACalculator
