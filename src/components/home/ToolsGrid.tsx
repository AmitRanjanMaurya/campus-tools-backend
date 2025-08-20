'use client'

import Link from 'next/link'
import { 
  Calculator, 
  Clock, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Brain, 
  Settings,
  PenTool,
  Timer,
  StickyNote,
  Calculator as Calc,
  FileSearch
} from 'lucide-react'

const tools = [
  {
    title: 'GPA Calculator',
    description: 'Calculate your GPA with support for multiple grading systems',
    icon: GraduationCap,
    href: '/tools/gpa-calculator',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Unit Converter',
    description: 'Convert between physics, math, and engineering units',
    icon: Settings,
    href: '/tools/unit-converter',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Resume Builder',
    description: 'Create professional resumes with PDF export',
    icon: FileText,
    href: '/tools/resume-builder',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Resume Analyzer',
    description: 'AI-powered feedback to improve your resume',
    icon: FileSearch,
    href: '/tools/resume-analyzer',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  {
    title: 'Study Timer',
    description: 'Pomodoro-based timer to boost your productivity',
    icon: Timer,
    href: '/tools/study-timer',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    title: 'Timetable Maker',
    description: 'Create and organize your weekly schedule',
    icon: Calendar,
    href: '/tools/timetable',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Flashcard Creator',
    description: 'Create, edit, and practice with digital flashcards',
    icon: Brain,
    href: '/tools/flashcards',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    title: 'Notes Organizer',
    description: 'Markdown editor with themes and tags for better organization',
    icon: StickyNote,
    href: '/tools/notes',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    title: 'Scientific Calculator',
    description: 'Advanced calculator for complex mathematical operations',
    icon: Calc,
    href: '/tools/scientific-calculator',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
]

const ToolsGrid = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Essential Student Tools
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Everything you need to excel in your academic journey, from calculations to organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="group card hover:scale-105 transform transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${tool.bgColor} mb-4`}>
                  <Icon className={`h-6 w-6 ${tool.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-secondary-600 text-sm leading-relaxed">
                  {tool.description}
                </p>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/tools" 
            className="btn-primary inline-flex items-center px-6 py-3"
          >
            View All Tools
            <Calculator className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ToolsGrid
