'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { Button } from '@/components/ui'
import { 
  Send, 
  Brain, 
  Camera, 
  FileText, 
  Image as ImageIcon, 
  BookOpen, 
  Lightbulb,
  MessageSquare,
  Save,
  Share,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Copy,
  Trash2,
  Plus,
  Sparkles,
  Code,
  Calculator,
  Atom,
  FlaskConical,
  Cpu,
  PieChart,
  History,
  Star,
  ChevronRight,
  ChevronDown,
  Play,
  RotateCcw,
  Settings,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react'

interface Question {
  id: string
  text: string
  subject: string
  timestamp: string
  imageUrl?: string
}

interface Solution {
  id: string
  questionId: string
  finalAnswer: string
  steps: string[]
  diagram?: string
  conceptsUsed: string[]
  suggestedFlashcard?: {
    front: string
    back: string
  }
  visualExplanation?: string
  codeExample?: string
  relatedTopics: string[]
  difficulty: 'basic' | 'intermediate' | 'advanced'
  timestamp: string
}

interface DoubtSession {
  id: string
  questions: Question[]
  solutions: Solution[]
  subject: string
  startTime: string
  lastActivity: string
}

const AIDoubtSolver = () => {
  const { user } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('general')
  const [reasoningStyle, setReasoningStyle] = useState<'basic' | 'exam' | 'expert'>('basic')
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [sessions, setSessions] = useState<DoubtSession[]>([])
  const [currentSession, setCurrentSession] = useState<DoubtSession | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showVisualMode, setShowVisualMode] = useState<boolean>(true)
  const [followUpQuestion, setFollowUpQuestion] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterSubject, setFilterSubject] = useState<string>('all')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const questionInputRef = useRef<HTMLTextAreaElement>(null)

  const subjects = [
    { id: 'general', name: '🎓 General', color: 'bg-blue-500' },
    { id: 'mathematics', name: '🔢 Mathematics', color: 'bg-green-500' },
    { id: 'physics', name: '⚛️ Physics', color: 'bg-purple-500' },
    { id: 'chemistry', name: '🧪 Chemistry', color: 'bg-red-500' },
    { id: 'computer-science', name: '💻 Computer Science', color: 'bg-indigo-500' },
    { id: 'biology', name: '🧬 Biology', color: 'bg-emerald-500' },
    { id: 'economics', name: '📊 Economics', color: 'bg-yellow-500' },
    { id: 'commerce', name: '💼 Commerce', color: 'bg-orange-500' }
  ]

  // Load saved sessions on component mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('student_tools_doubt_sessions')
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions)
        setSessions(parsedSessions)
        if (parsedSessions.length > 0) {
          setCurrentSession(parsedSessions[0])
          setSolutions(parsedSessions[0].solutions || [])
        }
      } catch (error) {
        console.error('Error loading saved sessions:', error)
        localStorage.removeItem('student_tools_doubt_sessions')
      }
    }
  }, [])

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('student_tools_doubt_sessions', JSON.stringify(sessions))
    }
  }, [sessions])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      alert('Please select a valid image file.')
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmitQuestion = async () => {
    if (!currentQuestion.trim() && !uploadedImage) {
      alert('Please enter a question or upload an image.')
      return
    }

    setIsLoading(true)

    try {
      // Create new question
      const newQuestion: Question = {
        id: Date.now().toString(),
        text: currentQuestion || 'Image-based question',
        subject: selectedSubject,
        timestamp: new Date().toISOString(),
        imageUrl: imagePreview || undefined
      }

      // Call AI API
      const response = await fetch('/api/ai-doubt-solver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion,
          subject: selectedSubject,
          reasoningStyle,
          imageData: imagePreview
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const aiResponse = await response.json()

      // Validate AI response
      if (!aiResponse.finalAnswer || !aiResponse.steps) {
        throw new Error('Invalid AI response format')
      }

      // Create solution with AI response
      const solution: Solution = {
        id: Date.now().toString(),
        questionId: newQuestion.id,
        ...aiResponse,
        timestamp: new Date().toISOString()
      }

      // Update current session or create new one
      let updatedSession: DoubtSession
      if (currentSession) {
        updatedSession = {
          ...currentSession,
          questions: [...currentSession.questions, newQuestion],
          solutions: [...currentSession.solutions, solution],
          lastActivity: new Date().toISOString()
        }
      } else {
        updatedSession = {
          id: Date.now().toString(),
          questions: [newQuestion],
          solutions: [solution],
          subject: selectedSubject,
          startTime: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        }
      }

      // Update state
      setCurrentSession(updatedSession)
      setSolutions([...solutions, solution])
      setSelectedSolution(solution)

      // Update sessions array
      const updatedSessions = currentSession 
        ? sessions.map(s => s.id === currentSession.id ? updatedSession : s)
        : [updatedSession, ...sessions]
      
      setSessions(updatedSessions)

      // Clear form
      setCurrentQuestion('')
      removeImage()

      // Show success message
      setTimeout(() => {
        alert('🎉 AI has solved your doubt! Check the detailed solution below with step-by-step explanation.')
      }, 500)

    } catch (error) {
      console.error('Error processing question:', error)
      alert('Error processing your question. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowUp = async () => {
    if (!followUpQuestion.trim() || !selectedSolution) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-doubt-solver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: `Follow-up: ${followUpQuestion} (Related to: ${selectedSolution.finalAnswer})`,
          subject: selectedSubject,
          reasoningStyle
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const aiResponse = await response.json()

      const followUpSolution: Solution = {
        id: Date.now().toString(),
        questionId: selectedSolution.questionId,
        ...aiResponse,
        timestamp: new Date().toISOString()
      }

      setSolutions([...solutions, followUpSolution])
      setSelectedSolution(followUpSolution)
      setFollowUpQuestion('')

    } catch (error) {
      console.error('Error processing follow-up:', error)
      alert('Error processing your follow-up question. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const saveToNotes = (solution: Solution) => {
    const noteContent = `
# ${selectedSubject.toUpperCase()} - Doubt Solution

**Question:** ${currentSession?.questions.find(q => q.id === solution.questionId)?.text || 'Question'}

**Answer:** ${solution.finalAnswer}

## Step-by-Step Solution:
${solution.steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

## Key Concepts Used:
${solution.conceptsUsed.map(concept => `- ${concept}`).join('\n')}

## Related Topics:
${solution.relatedTopics.map(topic => `- ${topic}`).join('\n')}

*Solved on: ${new Date().toLocaleDateString()}*
`

    // Save to localStorage (Notes integration)
    const existingNotes = JSON.parse(localStorage.getItem('student_tools_notes') || '[]')
    const newNote = {
      id: Date.now().toString(),
      title: `Doubt Solution: ${solution.finalAnswer.substring(0, 50)}...`,
      content: noteContent,
      tags: [selectedSubject, 'doubt-solution', ...solution.conceptsUsed],
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }

    existingNotes.unshift(newNote)
    localStorage.setItem('student_tools_notes', JSON.stringify(existingNotes))
    
    alert('💾 Solution saved to Notes Organizer!')
  }

  const createFlashcard = (solution: Solution) => {
    if (!solution.suggestedFlashcard) return

    const existingFlashcards = JSON.parse(localStorage.getItem('student_tools_flashcards') || '[]')
    const newFlashcard = {
      id: Date.now().toString(),
      front: solution.suggestedFlashcard.front,
      back: solution.suggestedFlashcard.back,
      subject: selectedSubject,
      difficulty: solution.difficulty,
      timestamp: new Date().toISOString(),
      reviewCount: 0,
      lastReviewed: null
    }

    existingFlashcards.unshift(newFlashcard)
    localStorage.setItem('student_tools_flashcards', JSON.stringify(existingFlashcards))
    
    alert('📚 Flashcard created successfully!')
  }

  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = !searchQuery || 
      solution.finalAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      solution.steps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesSubject = filterSubject === 'all' || 
      currentSession?.subject === filterSubject

    return matchesSearch && matchesSubject
  })

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access the AI Doubt Solver and get instant help with your academic questions.</p>
          <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Doubt Solver</h1>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-gray-600">
            Ask any academic question and get instant step-by-step solutions with visual explanations. 
            <span className="text-blue-600 font-medium"> Smart AI tutor at your service!</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Question Input */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Ask Your Question
              </h3>

              {/* Subject Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {subjects.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.id)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSubject === subject.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {subject.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reasoning Style */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation Style
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'basic', label: '🎯 Basic', desc: 'Simple explanation' },
                    { id: 'exam', label: '📝 Exam Style', desc: 'Detailed steps' },
                    { id: 'expert', label: '🎓 Expert', desc: 'In-depth analysis' }
                  ].map(style => (
                    <button
                      key={style.id}
                      onClick={() => setReasoningStyle(style.id as any)}
                      className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                        reasoningStyle === style.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={style.desc}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Question
                </label>
                <textarea
                  ref={questionInputRef}
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  placeholder="Type your academic question here... (e.g., 'Solve x² + x - 6 = 0', 'Explain Ohm's law with example', 'How does binary search work?')"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Question Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Upload Image
                  </Button>
                  {imagePreview && (
                    <Button
                      variant="outline"
                      onClick={removeImage}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Question"
                      className="max-w-full h-48 object-contain border border-gray-300 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitQuestion}
                disabled={isLoading || (!currentQuestion.trim() && !uploadedImage)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    🧠 AI is analyzing your question...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Solve My Doubt
                  </div>
                )}
              </Button>
            </div>

            {/* Solution Display */}
            {selectedSolution && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Solution
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveToNotes(selectedSolution)}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => createFlashcard(selectedSolution)}
                      disabled={!selectedSolution.suggestedFlashcard}
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Flashcard
                    </Button>
                  </div>
                </div>

                {/* Final Answer */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Final Answer:</h4>
                  <p className="text-green-700 text-lg">{selectedSolution.finalAnswer}</p>
                </div>

                {/* Step-by-Step Solution */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Step-by-Step Solution:
                  </h4>
                  <div className="space-y-3">
                    {selectedSolution.steps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm font-medium rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 flex-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Diagram */}
                {selectedSolution.diagram && showVisualMode && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <PieChart className="w-4 h-4" />
                      Visual Explanation:
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                        {selectedSolution.diagram}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Code Example */}
                {selectedSolution.codeExample && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Code Example:
                    </h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono whitespace-pre-wrap">
                        {selectedSolution.codeExample}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Concepts Used */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Key Concepts Used:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSolution.conceptsUsed.map((concept, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Related Topics */}
                {selectedSolution.relatedTopics.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Share className="w-4 h-4" />
                      Related Topics to Explore:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedSolution.relatedTopics.map((topic, index) => (
                        <div
                          key={index}
                          className="p-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                        >
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Question */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Ask Follow-up Question:</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      placeholder="Ask for clarification or related question..."
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      onClick={handleFollowUp}
                      disabled={!followUpQuestion.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - History & Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Solution History</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>

              {/* Search and Filter */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search solutions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{solutions.length}</p>
                  <p className="text-xs text-blue-700">Questions Solved</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{sessions.length}</p>
                  <p className="text-xs text-green-700">Study Sessions</p>
                </div>
              </div>

              {/* Solutions List */}
              {showHistory && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredSolutions.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 text-sm">No solutions yet</p>
                      <p className="text-gray-400 text-xs mt-1">Ask your first question to get started</p>
                    </div>
                  ) : (
                    filteredSolutions.slice().reverse().map((solution, index) => (
                      <div
                        key={solution.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSolution?.id === solution.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSolution(solution)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {solution.finalAnswer.substring(0, 40)}...
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`w-2 h-2 rounded-full ${
                                solution.difficulty === 'basic' ? 'bg-green-500' :
                                solution.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></span>
                              <span className="text-xs text-gray-500 capitalize">
                                {solution.difficulty}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(solution.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIDoubtSolver
