'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Calculator, 
  Clock, 
  FileText, 
  GraduationCap, 
  Calendar, 
  Brain, 
  Settings,
  Timer,
  StickyNote,
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Search,
  Bot,
  Shield,
  Network,
  FlaskConical,
  Briefcase,
  Users,
  FileCheck,
  HelpCircle,
  Code,
  DollarSign,
  Wallet,
  BookCopy,
  UserCheck,
  Apple
} from 'lucide-react'

const tools = [
  {
    title: 'Citation Generator',
    description: 'Generate citations in APA, MLA, and Chicago formats instantly',
    icon: FileText,
    href: '/tools/citation-generator',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    category: 'Academic'
  },
  {
    title: 'GPA Calculator',
    description: 'Calculate your GPA with multiple grading systems support',
    icon: GraduationCap,
    href: '/tools/gpa-calculator',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'Academic'
  },
  {
    title: 'Study Timer',
    description: 'Pomodoro-based timer with customizable intervals',
    icon: Timer,
    href: '/tools/study-timer',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    category: 'Productivity'
  },
  {
    title: 'Unit Converter',
    description: 'Convert between physics, math, and engineering units',
    icon: Settings,
    href: '/tools/unit-converter',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    category: 'Academic'
  },
  {
    title: 'Scientific Calculator',
    description: 'Advanced calculator for complex mathematical operations',
    icon: Calculator,
    href: '/tools/scientific-calculator',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    category: 'Academic'
  },
  {
    title: 'Resume Builder',
    description: 'Create professional resumes with templates and PDF export',
    icon: FileText,
    href: '/tools/resume-builder',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    category: 'Career'
  },
  {
    title: 'Resume Analyzer',
    description: 'AI-powered feedback to improve your resume and ATS compatibility',
    icon: FileCheck,
    href: '/tools/resume-analyzer',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    category: 'Career'
  },
  {
    title: 'Timetable Maker',
    description: 'Create and organize your weekly class schedule',
    icon: Calendar,
    href: '/tools/timetable',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    category: 'Productivity'
  },
  {
    title: 'Flashcard Creator',
    description: 'Create, edit, and practice with digital flashcards',
    icon: Brain,
    href: '/tools/flashcards',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    category: 'Study'
  },
  {
    title: 'Notes Organizer',
    description: 'Markdown editor with themes and tags for organization',
    icon: StickyNote,
    href: '/tools/notes',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    category: 'Study'
  },
  {
    title: 'Formula Repository',
    description: 'Quick access to mathematical and scientific formulas',
    icon: BookOpen,
    href: '/tools/formula-repository',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    category: 'Academic'
  },
  {
    title: 'Grade Tracker',
    description: 'Track your grades and academic progress with analytics',
    icon: TrendingUp,
    href: '/tools/grade-tracker',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    category: 'Academic'
  },
  // New Trending Tools
  {
    title: 'Quiz Practice Generator',
    description: 'AI-powered quiz creation from notes, topics, or uploaded material with multiple question types',
    icon: Bot,
    href: '/tools/quiz-generator',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    category: 'Study',
    isNew: true
  },
  {
    title: 'Budget Planner',
    description: 'Track expenses, manage monthly budgets, monitor fees, and achieve savings goals with visual analytics',
    icon: DollarSign,
    href: '/tools/budget-planner',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    category: 'Productivity',
    isNew: true
  },
  {
    title: 'EMI Calculator',
    description: 'Calculate loan EMIs for home, car, personal loans with amortization schedules and comparison tools',
    icon: Calculator,
    href: '/tools/emi-calculator',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'Finance',
    isNew: true
  },
  {
    title: 'Diet Planner',
    description: 'Get personalized nutrition plans, calorie tracking, and diet analysis designed for students',
    icon: Apple,
    href: '/tools/diet-planner',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    category: 'Health',
    isNew: true
  },
  {
    title: 'AI Study Guide Generator',
    description: 'Upload syllabus or notes → AI generates summarized guides and key points',
    icon: Bot,
    href: '/tools/ai-study-guide',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    category: 'Study',
    isNew: true
  },
  {
    title: 'Assignment Deadline Tracker',
    description: 'Calendar view + reminders for assignments, tests, and projects',
    icon: Calendar,
    href: '/tools/deadline-tracker',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    category: 'Productivity',
    isNew: true
  },
  {
    title: 'Plagiarism Checker',
    description: 'Scan assignments or papers for originality and AI-generated content',
    icon: Shield,
    href: '/tools/plagiarism-checker',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    category: 'Academic',
    isNew: true
  },
  {
    title: 'Mind Map Creator',
    description: 'Visual tool to organize concepts and ideas for better understanding',
    icon: Network,
    href: '/tools/mind-map',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    category: 'Study',
    isNew: true
  },
  {
    title: 'Lab Report Generator',
    description: 'Auto-structured reports from experiment data input',
    icon: FlaskConical,
    href: '/tools/lab-report-generator',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    category: 'Academic',
    isNew: true
  },
  {
    title: 'Internship Finder',
    description: 'Curated internship listings with resume matcher and application tracker',
    icon: Briefcase,
    href: '/tools/internship-finder',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'Career',
    isNew: true
  },
  {
    title: 'Online Whiteboard',
    description: 'Real-time collaborative sketching and drawing for study groups',
    icon: Users,
    href: '/tools/whiteboard',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    category: 'Study',
    isNew: true
  },
  {
    title: 'PDF Annotator',
    description: 'Upload, highlight, and comment on PDFs for better note-taking',
    icon: FileCheck,
    href: '/tools/pdf-annotator',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    category: 'Study',
    isNew: true
  },
  {
    title: 'AI Doubt Solver',
    description: 'Ask questions → Get visual + step-by-step solutions instantly',
    icon: HelpCircle,
    href: '/tools/ai-doubt-solver',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    category: 'Academic',
    isNew: true
  },
  {
    title: 'Code Playground',
    description: 'Online coding space for Python, Java, C++, JS with shareable links',
    icon: Code,
    href: '/tools/code-playground',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    category: 'Programming',
    isNew: true
  },
  {
    title: 'Scholarship Tracker',
    description: 'Browse and apply to scholarships with smart filters and deadlines',
    icon: DollarSign,
    href: '/tools/scholarship-tracker',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    category: 'Career',
    isNew: true
  },
  {
    title: 'Book & Notes Exchange',
    description: 'Share and request textbooks, handwritten notes, or PDF resources',
    icon: BookCopy,
    href: '/tools/book-exchange',
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
    category: 'Community',
    isNew: true
  },
  {
    title: 'AI Resume Analyzer',
    description: 'Upload resume → Get feedback and improvement suggestions',
    icon: UserCheck,
    href: '/tools/resume-analyzer',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    category: 'Career',
    isNew: true
  },
]

export default function ToolsPage() {
  const categories = ['All', 'Academic', 'Study', 'Productivity', 'Career', 'Programming', 'Finance', 'Community']
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredTools = selectedCategory === 'All' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory)

  const newTools = tools.filter(tool => tool.isNew)
  const existingTools = tools.filter(tool => !tool.isNew)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-secondary-600 hover:text-primary-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
            Student Tools Collection
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto mb-6">
            Comprehensive set of tools designed to enhance your academic productivity and success.
          </p>
          
          {/* New Tools Badge */}
          <div className="inline-flex items-center bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
            <TrendingUp className="h-4 w-4 mr-2" />
            {newTools.length} New AI-Powered & Trending Tools Added!
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-secondary-600 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* New & Trending Tools Section */}
        {(selectedCategory === 'All' || newTools.some(tool => tool.category === selectedCategory)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center bg-gradient-to-r from-violet-100 to-purple-100 px-6 py-3 rounded-full">
                <TrendingUp className="h-5 w-5 text-violet-600 mr-2" />
                <h2 className="text-2xl font-bold text-violet-900">New & Trending Tools</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedCategory === 'All' ? newTools : newTools.filter(tool => tool.category === selectedCategory))
                .map((tool, index) => {
                const Icon = tool.icon
                return (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="h-full relative"
                  >
                    <Link
                      href={tool.href}
                      className="group card hover:scale-105 transform transition-all duration-300 block h-full flex flex-col relative overflow-hidden"
                    >
                      {/* New Badge */}
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                        NEW
                      </div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${tool.bgColor} flex-shrink-0`}>
                          <Icon className={`h-6 w-6 ${tool.color}`} />
                        </div>
                        <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full whitespace-nowrap">
                          {tool.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-secondary-600 text-sm leading-relaxed flex-grow">
                        {tool.description}
                      </p>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Existing Tools Section */}
        {(selectedCategory === 'All' || existingTools.some(tool => tool.category === selectedCategory)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-900">Core Tools</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedCategory === 'All' ? existingTools : existingTools.filter(tool => tool.category === selectedCategory))
                .map((tool, index) => {
                const Icon = tool.icon
                return (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Link
                      href={tool.href}
                      className="group card hover:scale-105 transform transition-all duration-300 block h-full flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${tool.bgColor} flex-shrink-0`}>
                          <Icon className={`h-6 w-6 ${tool.color}`} />
                        </div>
                        <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full whitespace-nowrap">
                          {tool.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-secondary-600 text-sm leading-relaxed flex-grow">
                        {tool.description}
                      </p>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
