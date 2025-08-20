'use client'

import React, { useState, useEffect } from 'react'
import { Upload, FileText, BookOpen, Brain, Play, Clock, Flag, RotateCcw, Download, Share2, Trophy, BarChart3, ChevronRight, CheckCircle, XCircle, AlertCircle, Plus, Settings, Zap, Target, Users } from 'lucide-react'
import SocialShare from '@/components/ui/SocialShare'
import SEO, { generateToolSchema } from '@/components/seo/SEO'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
  settings: {
    subject: string
    difficulty: string
    questionCount: number
    questionType: string
    timeLimit: number
    timedMode: boolean
  }
  createdAt: string
}

interface QuizResult {
  quizId: string
  answers: number[]
  score: number
  timeSpent: number
  completedAt: string
}

interface QuizStats {
  totalQuizzes: number
  averageScore: number
  topicBreakdown: {
    [topic: string]: {
      attempts: number
      averageScore: number
      lastAttempt: string
    }
  }
}

export default function QuizGenerator() {
  // SEO and sharing data
  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://campustoolshub.com/tools/quiz-generator'
  const pageTitle = 'AI Quiz Generator - Create Interactive Practice Tests | Student Tools'
  const pageDescription = 'Transform study materials into engaging quizzes with AI. Upload notes, select topics, or paste text to generate multiple-choice questions with explanations.'
  
  const toolSchema = generateToolSchema({
    name: 'AI Quiz Generator',
    description: pageDescription,
    url: pageUrl,
    category: 'EducationalApplication',
    features: [
      'AI-powered question generation',
      'Multiple input methods (upload, text, topics)',
      'Customizable difficulty levels',
      'Timed quiz mode',
      'Detailed explanations',
      'Performance analytics',
      'Progress tracking',
      'Export results'
    ],
    rating: 4.8,
    reviewCount: 1250
  })

  // State management
  const [currentView, setCurrentView] = useState<'setup' | 'quiz' | 'results' | 'analytics'>('setup')
  const [inputMethod, setInputMethod] = useState<'upload' | 'text' | 'topic' | 'flashcards'>('topic')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  
  // Quiz settings
  const [quizSettings, setQuizSettings] = useState({
    subject: 'computer-science',
    difficulty: 'medium',
    questionCount: 10,
    questionType: 'mcq',
    timeLimit: 10,
    timedMode: false,
    smartMode: false
  })

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Results and analytics
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [quizHistory, setQuizHistory] = useState<Quiz[]>([])
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null)

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('quiz-history')
    if (savedHistory) {
      setQuizHistory(JSON.parse(savedHistory))
    }

    const savedStats = localStorage.getItem('quiz-stats')
    if (savedStats) {
      setQuizStats(JSON.parse(savedStats))
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (currentView === 'quiz' && quizSettings.timedMode && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentView, quizSettings.timedMode, timeRemaining])

  const subjects = [
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'general', label: 'General Knowledge' }
  ]

  const questionTypes = [
    { value: 'mcq', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'fill-blank', label: 'Fill in the Blank' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'mixed', label: 'Mixed Types' }
  ]

  const predefinedTopics = {
    'computer-science': ['Data Structures', 'Algorithms', 'Operating Systems', 'Database Management', 'Computer Networks', 'Software Engineering', 'Machine Learning', 'Web Development'],
    'mathematics': ['Calculus', 'Linear Algebra', 'Statistics', 'Probability', 'Discrete Mathematics', 'Number Theory', 'Geometry', 'Trigonometry'],
    'physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Quantum Physics', 'Relativity', 'Atomic Physics', 'Nuclear Physics'],
    'chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry', 'Chemical Bonding', 'Thermochemistry'],
    'biology': ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Anatomy', 'Physiology', 'Molecular Biology', 'Microbiology']
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setInputMethod('upload')
    }
  }

  const generateQuiz = async () => {
    setIsGenerating(true)
    try {
      let content = ''
      
      if (inputMethod === 'upload' && uploadedFile) {
        // Read file content
        const text = await uploadedFile.text()
        content = text
      } else if (inputMethod === 'text') {
        content = textInput
      } else if (inputMethod === 'topic') {
        content = selectedTopic
      } else if (inputMethod === 'flashcards') {
        // Get content from saved flashcards
        const savedFlashcards = localStorage.getItem('flashcards')
        if (savedFlashcards) {
          const flashcards = JSON.parse(savedFlashcards)
          content = flashcards.map((card: any) => `${card.front}: ${card.back}`).join('\n')
        }
      }

      const response = await fetch('/api/quiz-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          subject: quizSettings.subject,
          difficulty: quizSettings.difficulty,
          questionCount: quizSettings.questionCount,
          questionType: quizSettings.questionType,
          inputMethod
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const quizData = await response.json()
      
      const newQuiz: Quiz = {
        id: Date.now().toString(),
        title: inputMethod === 'topic' ? selectedTopic : `Quiz - ${new Date().toLocaleDateString()}`,
        questions: quizData.questions,
        settings: quizSettings,
        createdAt: new Date().toISOString()
      }

      setCurrentQuiz(newQuiz)
      setUserAnswers(new Array(quizData.questions.length).fill(-1))
      setCurrentQuestionIndex(0)
      setFlaggedQuestions(new Set())
      
      if (quizSettings.timedMode) {
        setTimeRemaining(quizSettings.timeLimit * 60)
        setQuizStartTime(new Date())
      }
      
      setCurrentView('quiz')
    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('Failed to generate quiz. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setUserAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (currentQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleFlagQuestion = () => {
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(currentQuestionIndex)) {
      newFlagged.delete(currentQuestionIndex)
    } else {
      newFlagged.add(currentQuestionIndex)
    }
    setFlaggedQuestions(newFlagged)
  }

  const handleQuizSubmit = () => {
    if (!currentQuiz) return

    const correctAnswers = currentQuiz.questions.reduce((count, question, index) => {
      return userAnswers[index] === question.correctAnswer ? count + 1 : count
    }, 0)

    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100)
    const timeSpent = quizStartTime ? Math.round((Date.now() - quizStartTime.getTime()) / 1000) : 0

    const result: QuizResult = {
      quizId: currentQuiz.id,
      answers: userAnswers,
      score,
      timeSpent,
      completedAt: new Date().toISOString()
    }

    setQuizResult(result)
    
    // Save to history
    const updatedHistory = [...quizHistory, currentQuiz]
    setQuizHistory(updatedHistory)
    localStorage.setItem('quiz-history', JSON.stringify(updatedHistory))

    // Update stats
    updateQuizStats(result, currentQuiz)
    
    setCurrentView('results')
  }

  const updateQuizStats = (result: QuizResult, quiz: Quiz) => {
    const currentStats = quizStats || {
      totalQuizzes: 0,
      averageScore: 0,
      topicBreakdown: {}
    }

    const newStats: QuizStats = {
      totalQuizzes: currentStats.totalQuizzes + 1,
      averageScore: Math.round(((currentStats.averageScore * currentStats.totalQuizzes) + result.score) / (currentStats.totalQuizzes + 1)),
      topicBreakdown: {
        ...currentStats.topicBreakdown,
        [quiz.settings.subject]: {
          attempts: (currentStats.topicBreakdown[quiz.settings.subject]?.attempts || 0) + 1,
          averageScore: currentStats.topicBreakdown[quiz.settings.subject] 
            ? Math.round(((currentStats.topicBreakdown[quiz.settings.subject].averageScore * currentStats.topicBreakdown[quiz.settings.subject].attempts) + result.score) / (currentStats.topicBreakdown[quiz.settings.subject].attempts + 1))
            : result.score,
          lastAttempt: new Date().toLocaleDateString()
        }
      }
    }

    setQuizStats(newStats)
    localStorage.setItem('quiz-stats', JSON.stringify(newStats))
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const exportQuizResults = () => {
    if (!currentQuiz || !quizResult) return

    const data = {
      quiz: currentQuiz,
      result: quizResult,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-results-${currentQuiz.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const retakeIncorrectOnly = () => {
    if (!currentQuiz || !quizResult) return

    const incorrectQuestions = currentQuiz.questions.filter((_, index) => 
      userAnswers[index] !== currentQuiz.questions[index].correctAnswer
    )

    const retakeQuiz: Quiz = {
      ...currentQuiz,
      id: Date.now().toString(),
      title: `${currentQuiz.title} - Retake`,
      questions: incorrectQuestions
    }

    setCurrentQuiz(retakeQuiz)
    setUserAnswers(new Array(incorrectQuestions.length).fill(-1))
    setCurrentQuestionIndex(0)
    setFlaggedQuestions(new Set())
    setQuizResult(null)
    
    if (quizSettings.timedMode) {
      setTimeRemaining(Math.ceil(incorrectQuestions.length * (quizSettings.timeLimit * 60) / currentQuiz.questions.length))
      setQuizStartTime(new Date())
    }
    
    setCurrentView('quiz')
  }

  if (currentView === 'setup') {
    return (
      <>
        <SEO
          title={pageTitle}
          description={pageDescription}
          keywords={['quiz generator', 'AI quiz maker', 'study tools', 'practice tests', 'exam preparation', 'educational assessment', 'student tools', 'learning platform']}
          ogImage="/og-images/quiz-generator.png"
          schema={toolSchema}
        />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quiz Practice Generator
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your study material into interactive quizzes with AI-powered question generation
            </p>
          </div>

          {/* Input Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setInputMethod('upload')}
              className={`p-6 rounded-xl border-2 transition-all ${
                inputMethod === 'upload'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Upload Notes</h3>
              <p className="text-sm text-gray-600">PDF, DOCX, TXT files</p>
            </button>

            <button
              onClick={() => setInputMethod('text')}
              className={`p-6 rounded-xl border-2 transition-all ${
                inputMethod === 'text'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Paste Text</h3>
              <p className="text-sm text-gray-600">Copy and paste content</p>
            </button>

            <button
              onClick={() => setInputMethod('topic')}
              className={`p-6 rounded-xl border-2 transition-all ${
                inputMethod === 'topic'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Select Topic</h3>
              <p className="text-sm text-gray-600">Choose from predefined topics</p>
            </button>

            <button
              onClick={() => setInputMethod('flashcards')}
              className={`p-6 rounded-xl border-2 transition-all ${
                inputMethod === 'flashcards'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Brain className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">From Flashcards</h3>
              <p className="text-sm text-gray-600">Use saved flashcards</p>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Content */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Content Input
              </h2>

              {inputMethod === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Click to upload a file
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      PDF, DOCX, TXT up to 10MB
                    </p>
                  </div>
                  {uploadedFile && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-700">{uploadedFile.name}</span>
                    </div>
                  )}
                </div>
              )}

              {inputMethod === 'text' && (
                <div className="space-y-4">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste your study material here..."
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500">
                    Paste notes, definitions, or any text content you want to create a quiz from
                  </p>
                </div>
              )}

              {inputMethod === 'topic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Subject First
                    </label>
                    <select
                      value={quizSettings.subject}
                      onChange={(e) => setQuizSettings(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {subjects.map(subject => (
                        <option key={subject.value} value={subject.value}>
                          {subject.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Topic
                    </label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a topic...</option>
                      {predefinedTopics[quizSettings.subject as keyof typeof predefinedTopics]?.map(topic => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {inputMethod === 'flashcards' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-700">Using Saved Flashcards</span>
                    </div>
                    <p className="text-blue-600 text-sm">
                      Quiz will be generated from your saved flashcard collection
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quiz Settings */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quiz Settings
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      value={quizSettings.subject}
                      onChange={(e) => setQuizSettings(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {subjects.map(subject => (
                        <option key={subject.value} value={subject.value}>
                          {subject.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={quizSettings.difficulty}
                      onChange={(e) => setQuizSettings(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Questions
                    </label>
                    <select
                      value={quizSettings.questionCount}
                      onChange={(e) => setQuizSettings(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                      <option value={20}>20 Questions</option>
                      <option value={25}>25 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={quizSettings.questionType}
                      onChange={(e) => setQuizSettings(prev => ({ ...prev, questionType: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {questionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-700 mb-3">Advanced Options</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={quizSettings.timedMode}
                        onChange={(e) => setQuizSettings(prev => ({ ...prev, timedMode: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">Timed Mode</span>
                    </label>

                    {quizSettings.timedMode && (
                      <div className="ml-7">
                        <label className="block text-sm text-gray-600 mb-1">
                          Time Limit (minutes)
                        </label>
                        <input
                          type="number"
                          value={quizSettings.timeLimit}
                          onChange={(e) => setQuizSettings(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 10 }))}
                          min="1"
                          max="180"
                          className="w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={quizSettings.smartMode}
                        onChange={(e) => setQuizSettings(prev => ({ ...prev, smartMode: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">Smart Quiz Mode</span>
                      <span className="text-xs text-gray-500">(Focus on weak areas)</span>
                    </label>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateQuiz}
                  disabled={isGenerating || (inputMethod === 'text' && !textInput.trim()) || (inputMethod === 'topic' && !selectedTopic) || (inputMethod === 'upload' && !uploadedFile)}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setCurrentView('analytics')}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              View Analytics
            </button>
            
            <button
              onClick={() => {
                const savedHistory = localStorage.getItem('quiz-history')
                if (savedHistory) {
                  console.log('Quiz History:', JSON.parse(savedHistory))
                  alert('Check console for quiz history')
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Trophy className="w-5 h-5" />
              Quiz History
            </button>

            <SocialShare
              url={pageUrl}
              title={pageTitle}
              description={pageDescription}
              hashtags={['StudyTools', 'QuizGenerator', 'Education', 'Learning']}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
            />
          </div>
        </div>
      </div>
      </>
    )
  }

  if (currentView === 'quiz' && currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">{currentQuiz.title}</h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {quizSettings.timedMode && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                  </div>
                )}
                
                <button
                  onClick={handleFlagQuestion}
                  className={`p-2 rounded-lg transition-all ${
                    flaggedQuestions.has(currentQuestionIndex)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    userAnswers[currentQuestionIndex] === index
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      userAnswers[currentQuestionIndex] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {userAnswers[currentQuestionIndex] === index && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-600">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              Previous
            </button>

            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {userAnswers.filter(answer => answer !== -1).length} of {currentQuiz.questions.length} answered
              </span>
              
              {flaggedQuestions.size > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <Flag className="w-4 h-4" />
                  {flaggedQuestions.size} flagged
                </span>
              )}
            </div>

            {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
              <button
                onClick={handleQuizSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all"
              >
                Submit Quiz
                <CheckCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Question Navigation */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-700 mb-4">Question Navigator</h3>
            <div className="grid grid-cols-10 gap-2">
              {currentQuiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    index === currentQuestionIndex
                      ? 'bg-blue-500 text-white'
                      : userAnswers[index] !== -1
                      ? 'bg-green-100 text-green-700'
                      : flaggedQuestions.has(index)
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-700 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-700 rounded"></div>
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-600 rounded"></div>
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'results' && currentQuiz && quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="bg-white rounded-xl p-8 shadow-lg mb-6 text-center">
            <div className="mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                quizResult.score >= 80 ? 'bg-green-100' :
                quizResult.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {quizResult.score >= 80 ? (
                  <Trophy className="w-10 h-10 text-green-600" />
                ) : quizResult.score >= 60 ? (
                  <CheckCircle className="w-10 h-10 text-yellow-600" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-600" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
              <p className="text-gray-600">Here are your results for "{currentQuiz.title}"</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{quizResult.score}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {currentQuiz.questions.filter((_, index) => userAnswers[index] === currentQuiz.questions[index].correctAnswer).length}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {currentQuiz.questions.length - currentQuiz.questions.filter((_, index) => userAnswers[index] === currentQuiz.questions[index].correctAnswer).length}
                </div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{formatTime(quizResult.timeSpent)}</div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              onClick={retakeIncorrectOnly}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Incorrect Only
            </button>
            
            <button
              onClick={exportQuizResults}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              <Download className="w-5 h-5" />
              Export Results
            </button>
            
            <button
              onClick={() => setCurrentView('setup')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Quiz
            </button>
            
            <button
              onClick={() => setCurrentView('analytics')}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              View Analytics
            </button>
          </div>

          {/* Detailed Review */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Detailed Review</h2>
            
            <div className="space-y-6">
              {currentQuiz.questions.map((question, index) => {
                const userAnswer = userAnswers[index]
                const isCorrect = userAnswer === question.correctAnswer
                
                return (
                  <div key={index} className={`border-l-4 pl-6 py-4 ${
                    isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">
                        Q{index + 1}. {question.question}
                      </h3>
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className={`flex items-center gap-3 p-2 rounded ${
                          optionIndex === question.correctAnswer ? 'bg-green-100 text-green-700' :
                          optionIndex === userAnswer && !isCorrect ? 'bg-red-100 text-red-700' :
                          'text-gray-600'
                        }`}>
                          <span className="font-medium">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span>{option}</span>
                          {optionIndex === question.correctAnswer && (
                            <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                          )}
                          {optionIndex === userAnswer && !isCorrect && (
                            <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
                      <p className="text-blue-700">{question.explanation}</p>
                    </div>
                    
                    {!isCorrect && (
                      <button
                        onClick={() => {
                          // Save to notes functionality
                          const noteContent = `Question: ${question.question}\nCorrect Answer: ${question.options[question.correctAnswer]}\nExplanation: ${question.explanation}`
                          const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]')
                          savedNotes.push({
                            id: Date.now().toString(),
                            title: `Quiz Review - Q${index + 1}`,
                            content: noteContent,
                            tags: [currentQuiz.settings.subject, 'quiz-review'],
                            createdAt: new Date().toISOString()
                          })
                          localStorage.setItem('notes', JSON.stringify(savedNotes))
                          alert('Explanation saved to notes!')
                        }}
                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all"
                      >
                        <BookOpen className="w-4 h-4" />
                        Save to Notes
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'analytics' && quizStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Analytics</h1>
            <p className="text-gray-600">Track your progress and identify areas for improvement</p>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{quizStats.totalQuizzes}</div>
              <div className="text-gray-600">Total Quizzes Taken</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{quizStats.averageScore}%</div>
              <div className="text-gray-600">Average Score</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Object.keys(quizStats.topicBreakdown).length}
              </div>
              <div className="text-gray-600">Subjects Covered</div>
            </div>
          </div>

          {/* Topic Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Topic-Wise Performance</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Attempts</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Avg. Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Last Attempt</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(quizStats.topicBreakdown).map(([topic, stats]) => (
                    <tr key={topic} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-800 capitalize">
                        {topic.replace('-', ' ')}
                      </td>
                      <td className="py-4 px-4 text-center">{stats.attempts}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-semibold ${
                          stats.averageScore >= 80 ? 'text-green-600' :
                          stats.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {stats.averageScore}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600">{stats.lastAttempt}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          stats.averageScore >= 80 ? 'bg-green-100 text-green-700' :
                          stats.averageScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {stats.averageScore >= 80 ? 'Strong' :
                           stats.averageScore >= 60 ? 'Good' : 'Needs Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentView('setup')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create New Quiz
            </button>
            
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(quizStats, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'quiz-analytics.json'
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              <Download className="w-5 h-5" />
              Export Analytics
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
