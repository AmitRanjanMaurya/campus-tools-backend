'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit3, Trash2, Play, Shuffle, Download, Upload, BookOpen, Target, TrendingUp, RotateCcw, Eye, EyeOff, Settings, Check, X } from 'lucide-react'

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  lastStudied?: Date
  correctCount: number
  incorrectCount: number
}

interface FlashcardSet {
  id: string
  name: string
  description: string
  cards: Flashcard[]
  tags: string[]
  createdAt: Date
  lastStudied?: Date
  color?: string
}

type StudyMode = 'flip' | 'quiz' | null

interface Settings {
  theme: 'light' | 'dark'
  fontSize: 'small' | 'medium' | 'large'
  autoAdvance: boolean
}

export default function FlashcardCreator() {
  // State management
  const [sets, setSets] = useState<FlashcardSet[]>([])
  const [activeSet, setActiveSet] = useState<FlashcardSet | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<Flashcard | null>(null)
  const [studyMode, setStudyMode] = useState<StudyMode>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyCards, setStudyCards] = useState<Flashcard[]>([])
  const [isShuffled, setIsShuffled] = useState(false)
  const [studyProgress, setStudyProgress] = useState({ correct: 0, incorrect: 0, studied: 0 })
  const [isClient, setIsClient] = useState(false)
  const [settings, setSettings] = useState<Settings>({ theme: 'light', fontSize: 'medium', autoAdvance: false })
  const [showSettings, setShowSettings] = useState(false)
  const [quizOptions, setQuizOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')

  // Form state
  const [newSetForm, setNewSetForm] = useState({ name: '', description: '', tags: '' })
  const [cardForm, setCardForm] = useState<{ front: string, back: string, difficulty: 'easy' | 'medium' | 'hard', tags: string }>({ front: '', back: '', difficulty: 'medium', tags: '' })

  // Load data from localStorage on mount
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const savedSets = localStorage.getItem('flashcard-sets')
      if (savedSets) {
        const parsedSets = JSON.parse(savedSets).map((set: any) => ({
          ...set,
          createdAt: new Date(set.createdAt),
          lastStudied: set.lastStudied ? new Date(set.lastStudied) : undefined,
          tags: set.tags || [],
          cards: set.cards.map((card: any) => ({
            ...card,
            lastStudied: card.lastStudied ? new Date(card.lastStudied) : undefined,
            tags: card.tags || []
          }))
        }))
        setSets(parsedSets)
      }
      
      // Load settings
      const savedSettings = localStorage.getItem('flashcard-settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    }
  }, [])

  // Save to localStorage whenever sets change
  useEffect(() => {
    if (isClient && sets.length >= 0) {
      localStorage.setItem('flashcard-sets', JSON.stringify(sets))
    }
  }, [sets, isClient])

  // Save settings to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('flashcard-settings', JSON.stringify(settings))
    }
  }, [settings, isClient])

  // Keyboard navigation for study mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!studyMode || !studyCards[currentCardIndex]) return
      
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault()
          if (studyMode === 'flip') {
            setIsFlipped(!isFlipped)
          }
          break
        case '1':
          if (studyMode === 'flip' && isFlipped) {
            handleStudyAnswer(false)
          }
          break
        case '2':
          if (studyMode === 'flip' && isFlipped) {
            handleStudyAnswer(true)
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          previousCard()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextCard()
          break
        case 'Escape':
          setStudyMode(null)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [studyMode, isFlipped, currentCardIndex, studyCards]) // Removed function dependencies

  // Create new flashcard set
  const createSet = () => {
    if (!newSetForm.name.trim()) return

    const newSet: FlashcardSet = {
      id: Date.now().toString(),
      name: newSetForm.name,
      description: newSetForm.description,
      tags: newSetForm.tags ? newSetForm.tags.split(',').map(tag => tag.trim()) : [],
      cards: [],
      createdAt: new Date()
    }

    setSets([...sets, newSet])
    setActiveSet(newSet)
    setNewSetForm({ name: '', description: '', tags: '' })
    setIsCreating(false)
  }

  // Add card to active set
  const addCard = () => {
    if (!activeSet || !cardForm.front.trim() || !cardForm.back.trim()) return

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: cardForm.front,
      back: cardForm.back,
      difficulty: cardForm.difficulty,
      tags: cardForm.tags ? cardForm.tags.split(',').map(tag => tag.trim()) : [],
      correctCount: 0,
      incorrectCount: 0
    }

    const updatedSet = {
      ...activeSet,
      cards: [...activeSet.cards, newCard]
    }

    const updatedSets = sets.map(set => set.id === activeSet.id ? updatedSet : set)
    setSets(updatedSets)
    setActiveSet(updatedSet)
    setCardForm({ front: '', back: '', difficulty: 'medium', tags: '' })
  }

  // Edit card
  const updateCard = () => {
    if (!activeSet || !isEditing || !cardForm.front.trim() || !cardForm.back.trim()) return

    const updatedCards = activeSet.cards.map(card =>
      card.id === isEditing.id
        ? { 
            ...card, 
            front: cardForm.front, 
            back: cardForm.back, 
            difficulty: cardForm.difficulty as any,
            tags: cardForm.tags ? cardForm.tags.split(',').map(tag => tag.trim()) : []
          }
        : card
    )

    const updatedSet = { ...activeSet, cards: updatedCards }
    const updatedSets = sets.map(set => set.id === activeSet.id ? updatedSet : set)
    
    setSets(updatedSets)
    setActiveSet(updatedSet)
    setIsEditing(null)
    setCardForm({ front: '', back: '', difficulty: 'medium', tags: '' })
  }

  // Delete card
  const deleteCard = (cardId: string) => {
    if (!activeSet) return

    const updatedCards = activeSet.cards.filter(card => card.id !== cardId)
    const updatedSet = { ...activeSet, cards: updatedCards }
    const updatedSets = sets.map(set => set.id === activeSet.id ? updatedSet : set)
    
    setSets(updatedSets)
    setActiveSet(updatedSet)
  }

  // Delete set
  const deleteSet = (setId: string) => {
    setSets(sets.filter(set => set.id !== setId))
    if (activeSet?.id === setId) {
      setActiveSet(null)
    }
  }

  // Start study session
  const startStudy = (mode: StudyMode, shuffle = false) => {
    if (!activeSet || activeSet.cards.length === 0) return

    let cardsToStudy = [...activeSet.cards]
    if (shuffle) {
      cardsToStudy = cardsToStudy.sort(() => Math.random() - 0.5)
      setIsShuffled(true)
    } else {
      setIsShuffled(false)
    }

    setStudyCards(cardsToStudy)
    setStudyMode(mode)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setStudyProgress({ correct: 0, incorrect: 0, studied: 0 })
    setSelectedAnswer('')
    
    // Generate quiz options for quiz mode
    if (mode === 'quiz' && cardsToStudy.length > 0) {
      generateQuizOptions(cardsToStudy[0])
    }
  }

  // Generate multiple choice options for quiz mode
  const generateQuizOptions = useCallback((currentCard: Flashcard) => {
    if (!activeSet) return
    
    const allCards = activeSet.cards.filter(card => card.id !== currentCard.id)
    const wrongOptions = allCards
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(card => card.back)
    
    const options = [currentCard.back, ...wrongOptions]
      .sort(() => Math.random() - 0.5)
    
    setQuizOptions(options)
  }, [activeSet])

  // Handle study answer
  const handleStudyAnswer = useCallback((isCorrect: boolean) => {
    if (!activeSet || !studyCards[currentCardIndex]) return

    const currentCard = studyCards[currentCardIndex]
    const updatedCards = activeSet.cards.map(card =>
      card.id === currentCard.id
        ? {
            ...card,
            correctCount: isCorrect ? card.correctCount + 1 : card.correctCount,
            incorrectCount: !isCorrect ? card.incorrectCount + 1 : card.incorrectCount,
            lastStudied: new Date()
          }
        : card
    )

    const updatedSet = { ...activeSet, cards: updatedCards, lastStudied: new Date() }
    const updatedSets = sets.map(set => set.id === activeSet.id ? updatedSet : set)
    
    setSets(updatedSets)
    setActiveSet(updatedSet)
    setStudyProgress(prev => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      studied: prev.studied + 1
    }))

    // Move to next card or end session
    if (currentCardIndex < studyCards.length - 1) {
      const nextIndex = currentCardIndex + 1
      setCurrentCardIndex(nextIndex)
      setIsFlipped(false) // Always start with question/front side
      setSelectedAnswer('')
      
      // Generate new quiz options for next card in quiz mode
      if (studyMode === 'quiz' && studyCards[nextIndex]) {
        generateQuizOptions(studyCards[nextIndex])
      }
    } else {
      // End of study session
      const finalCorrect = studyProgress.correct + (isCorrect ? 1 : 0)
      const finalIncorrect = studyProgress.incorrect + (!isCorrect ? 1 : 0)
      const accuracy = Math.round((finalCorrect / (finalCorrect + finalIncorrect)) * 100)
      
      alert(`Study session complete!\nCorrect: ${finalCorrect}\nIncorrect: ${finalIncorrect}\nAccuracy: ${accuracy}%`)
      setStudyMode(null)
    }
  }, [activeSet, studyCards, currentCardIndex, sets, studyProgress, studyMode, generateQuizOptions])

  // Navigate to next card without answering (for practice)
  const nextCard = useCallback(() => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false) // Always start with question/front side
      setSelectedAnswer('')
      
      if (studyMode === 'quiz' && studyCards[currentCardIndex + 1]) {
        generateQuizOptions(studyCards[currentCardIndex + 1])
      }
    }
  }, [currentCardIndex, studyCards, studyMode, generateQuizOptions])

  // Shuffle current study cards
  const shuffleStudyCards = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5)
    setStudyCards(shuffled)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setSelectedAnswer('')
    setIsShuffled(true)
    
    if (studyMode === 'quiz' && shuffled[0]) {
      generateQuizOptions(shuffled[0])
    }
  }

  // Navigate to previous card
  const previousCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false) // Always start with question/front side
      setSelectedAnswer('')
      
      if (studyMode === 'quiz' && studyCards[currentCardIndex - 1]) {
        generateQuizOptions(studyCards[currentCardIndex - 1])
      }
    }
  }, [currentCardIndex, studyCards, studyMode, generateQuizOptions])

  // Handle quiz answer selection
  const handleQuizAnswer = (selectedOption: string) => {
    const currentCard = studyCards[currentCardIndex]
    const isCorrect = selectedOption === currentCard.back
    setSelectedAnswer(selectedOption)
    
    // Auto-advance after a short delay or wait for user confirmation
    setTimeout(() => {
      handleStudyAnswer(isCorrect)
    }, settings.autoAdvance ? 1500 : 0)
  }

  // Export set as JSON
  const exportSet = () => {
    if (!activeSet) return

    const dataStr = JSON.stringify(activeSet, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${activeSet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_flashcards.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Import set from JSON
  const importSet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSet = JSON.parse(e.target?.result as string)
        const newSet: FlashcardSet = {
          ...importedSet,
          id: Date.now().toString(),
          createdAt: new Date(),
          cards: importedSet.cards.map((card: any) => ({
            ...card,
            id: Date.now().toString() + Math.random(),
            correctCount: card.correctCount || 0,
            incorrectCount: card.incorrectCount || 0
          }))
        }
        setSets([...sets, newSet])
        alert('Flashcard set imported successfully!')
      } catch (error) {
        alert('Error importing file. Please make sure it\'s a valid JSON file.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  // Study Mode Component
  const StudyModeComponent = () => {
    if (!studyMode || !studyCards[currentCardIndex]) return null

    const currentCard = studyCards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / studyCards.length) * 100
    const isQuizMode = studyMode === 'quiz'

    const getFontSizeClass = () => {
      switch (settings.fontSize) {
        case 'small': return 'text-base'
        case 'large': return 'text-xl'
        default: return 'text-lg'
      }
    }

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`rounded-3xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden ${
          settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            settings.theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
          }`}>
            <div>
              <h2 className={`text-xl font-bold ${settings.theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                {activeSet?.name} - {isQuizMode ? 'Quiz Mode' : 'Study Mode'}
              </h2>
              <p className={`text-sm ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Card {currentCardIndex + 1} of {studyCards.length}
                {isShuffled && <span className="ml-2 text-orange-500 font-medium">(Shuffled ✨)</span>}
              </p>
            </div>
            <button
              onClick={() => setStudyMode(null)}
              className={`p-3 rounded-full transition-colors ${
                settings.theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className={`w-full rounded-full h-3 ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform skew-x-12 animate-pulse"></div>
              </div>
            </div>
            <div className={`text-center text-xs mt-2 font-medium ${
              settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {Math.round(progress)}% Complete
            </div>
          </div>

          {/* Card Content */}
          <div className="p-8">
            {isQuizMode ? (
              /* Quiz Mode */
              <div className="space-y-6">
                {/* Question Card */}
                <div className={`relative mx-auto max-w-lg transform hover:scale-[1.02] transition-transform duration-200`}>
                  <div className={`rounded-2xl p-8 shadow-2xl border-2 ${
                    settings.theme === 'dark' 
                      ? 'bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700' 
                      : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                  } relative overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent transform rotate-45"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <div className={`text-sm font-semibold mb-4 uppercase tracking-wider ${
                        settings.theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                      }`}>
                        Question {currentCardIndex + 1}
                      </div>
                      <div className={`${getFontSizeClass()} font-bold leading-relaxed ${
                        settings.theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {currentCard.front}
                      </div>
                    </div>
                    
                    {/* Decorative corners */}
                    <div className={`absolute top-4 left-4 w-3 h-3 rounded-full ${
                      settings.theme === 'dark' ? 'bg-blue-400' : 'bg-blue-300'
                    }`}></div>
                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                      settings.theme === 'dark' ? 'bg-blue-400' : 'bg-blue-300'
                    }`}></div>
                    <div className={`absolute bottom-4 left-4 w-3 h-3 rounded-full ${
                      settings.theme === 'dark' ? 'bg-blue-400' : 'bg-blue-300'
                    }`}></div>
                    <div className={`absolute bottom-4 right-4 w-3 h-3 rounded-full ${
                      settings.theme === 'dark' ? 'bg-blue-400' : 'bg-blue-300'
                    }`}></div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-4">
                  <div className={`text-center text-sm font-semibold ${
                    settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Choose the correct answer:
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
                    {quizOptions.map((option, index) => {
                      const isSelected = selectedAnswer === option
                      const isCorrect = option === currentCard.back
                      const showResult = selectedAnswer !== ''
                      
                      return (
                        <button
                          key={index}
                          onClick={() => !selectedAnswer && handleQuizAnswer(option)}
                          disabled={!!selectedAnswer}
                          className={`relative p-4 text-left rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                            showResult
                              ? isCorrect
                                ? 'bg-gradient-to-r from-green-100 to-green-50 border-green-300 text-green-800 shadow-lg'
                                : isSelected
                                ? 'bg-gradient-to-r from-red-100 to-red-50 border-red-300 text-red-800 shadow-lg'
                                : settings.theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-gray-400'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                              : settings.theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 hover:border-gray-500 shadow-md'
                              : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`${getFontSizeClass()} flex items-center`}>
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 text-sm font-bold ${
                                showResult
                                  ? isCorrect
                                    ? 'bg-green-200 text-green-800'
                                    : isSelected
                                    ? 'bg-red-200 text-red-800'
                                    : 'bg-gray-200 text-gray-600'
                                  : settings.theme === 'dark'
                                  ? 'bg-gray-600 text-gray-200'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </span>
                              {option}
                            </div>
                            {showResult && isCorrect && (
                              <Check className="h-6 w-6 text-green-600" />
                            )}
                            {showResult && isSelected && !isCorrect && (
                              <X className="h-6 w-6 text-red-600" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Flip Mode - 3D Card */
              <div className="flex justify-center">
                <div className="relative w-full max-w-lg h-80" style={{ perspective: '1000px' }}>
                  <div
                    className={`relative w-full h-full cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front Side - Question */}
                    <div
                      className={`absolute inset-0 backface-hidden rounded-2xl shadow-2xl ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                      style={{ backfaceVisibility: 'hidden', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    >
                      <div className={`w-full h-full rounded-2xl p-8 flex flex-col justify-center items-center relative overflow-hidden ${
                        settings.theme === 'dark' 
                          ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 border-2 border-blue-700' 
                          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 border-2 border-blue-200'
                      }`}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent transform rotate-45"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-white opacity-20"></div>
                        </div>
                        
                        {/* Question Badge */}
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                          settings.theme === 'dark' ? 'bg-blue-400 text-blue-900' : 'bg-blue-500 text-white'
                        }`}>
                          Q
                        </div>
                        
                        {/* Card Number */}
                        <div className={`absolute top-4 right-4 text-sm font-bold ${
                          settings.theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          {currentCardIndex + 1}/{studyCards.length}
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10 text-center">
                          <div className={`text-sm font-semibold mb-6 uppercase tracking-widest ${
                            settings.theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                          }`}>
                            Question
                          </div>
                          <div className={`${getFontSizeClass()} font-bold leading-relaxed mb-8 ${
                            settings.theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {currentCard.front}
                          </div>
                          <div className={`text-sm animate-pulse ${
                            settings.theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                          }`}>
                            Click to reveal answer ✨
                          </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full ${
                          settings.theme === 'dark' ? 'bg-blue-400' : 'bg-blue-300'
                        }`}></div>
                      </div>
                    </div>

                    {/* Back Side - Answer */}
                    <div
                      className={`absolute inset-0 backface-hidden rounded-2xl shadow-2xl ${
                        isFlipped ? 'rotate-y-0' : 'rotate-y-180'
                      }`}
                      style={{ backfaceVisibility: 'hidden', transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)' }}
                    >
                      <div className={`w-full h-full rounded-2xl p-8 flex flex-col justify-center items-center relative overflow-hidden ${
                        settings.theme === 'dark' 
                          ? 'bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 border-2 border-green-700' 
                          : 'bg-gradient-to-br from-green-50 via-white to-emerald-50 border-2 border-green-200'
                      }`}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent transform -rotate-45"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-white opacity-20"></div>
                        </div>
                        
                        {/* Answer Badge */}
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                          settings.theme === 'dark' ? 'bg-green-400 text-green-900' : 'bg-green-500 text-white'
                        }`}>
                          A
                        </div>
                        
                        {/* Card Number */}
                        <div className={`absolute top-4 right-4 text-sm font-bold ${
                          settings.theme === 'dark' ? 'text-green-300' : 'text-green-600'
                        }`}>
                          {currentCardIndex + 1}/{studyCards.length}
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10 text-center">
                          <div className={`text-sm font-semibold mb-6 uppercase tracking-widest ${
                            settings.theme === 'dark' ? 'text-green-300' : 'text-green-600'
                          }`}>
                            Answer
                          </div>
                          <div className={`${getFontSizeClass()} font-bold leading-relaxed mb-8 ${
                            settings.theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {currentCard.back}
                          </div>
                          <div className={`text-sm ${
                            settings.theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`}>
                            Was your answer correct? 🤔
                          </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full ${
                          settings.theme === 'dark' ? 'bg-green-400' : 'bg-green-300'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={`flex items-center justify-between p-6 border-t ${
            settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-4">
              {/* Navigation Buttons */}
              <button
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                className={`px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  settings.theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Previous
              </button>
              <button
                onClick={nextCard}
                disabled={currentCardIndex === studyCards.length - 1}
                className={`px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  settings.theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Next
              </button>
              <button
                onClick={shuffleStudyCards}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-orange-900 text-orange-300 hover:bg-orange-800'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                <Shuffle className="h-4 w-4 mr-1 inline" />
                Shuffle
              </button>
              
              {/* Progress Stats */}
              <div className="flex items-center space-x-4 text-sm ml-4">
                <span className={`flex items-center ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  {studyProgress.correct}
                </span>
                <span className={`flex items-center ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <X className="h-4 w-4 text-red-500 mr-1" />
                  {studyProgress.incorrect}
                </span>
                <span className={`text-xs ${settings.theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {studyProgress.studied}/{studyCards.length} studied
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!isQuizMode && isFlipped && (
                <>
                  <button
                    onClick={() => handleStudyAnswer(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      settings.theme === 'dark'
                        ? 'bg-red-900 text-red-300 hover:bg-red-800'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    Incorrect (1)
                  </button>
                  <button
                    onClick={() => handleStudyAnswer(true)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      settings.theme === 'dark'
                        ? 'bg-green-900 text-green-300 hover:bg-green-800'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    Correct (2)
                  </button>
                </>
              )}

              {!isQuizMode && !isFlipped && (
                <button
                  onClick={() => setIsFlipped(true)}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    settings.theme === 'dark'
                      ? 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Show Answer (Space)
                </button>
              )}

              {isQuizMode && selectedAnswer && !settings.autoAdvance && (
                <button
                  onClick={() => handleStudyAnswer(selectedAnswer === currentCard.back)}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    settings.theme === 'dark'
                      ? 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Next Card
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-gray-900' : ''}`} style={{ backgroundColor: settings.theme === 'light' ? '#f1f9fe' : '#1a1a1a' }}>
      {/* Header */}
      <div className={`${settings.theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-md border-b ${settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/tools" className={`flex items-center ${settings.theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Tools
              </Link>
              <div className={settings.theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}>|</div>
              <div>
                <h1 className={`text-xl font-bold ${settings.theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Flashcard Creator</h1>
                <p className={`text-sm ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Create and study with digital flashcards</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  settings.theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Settings className="h-4 w-4" />
              </button>
              {activeSet && (
                <>
                  <label className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    settings.theme === 'dark'
                      ? 'bg-purple-900 text-purple-300 hover:bg-purple-800'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}>
                    <Upload className="h-4 w-4 mr-2 inline" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSet}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={exportSet}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      settings.theme === 'dark'
                        ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    <Download className="h-4 w-4 mr-2 inline" />
                    Export
                  </button>
                </>
              )}
              <button
                onClick={() => setIsCreating(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <Plus className="h-4 w-4 mr-2 inline" />
                New Set
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Panel */}
        {showSettings && (
          <div className={`mb-6 p-6 rounded-2xl shadow-lg ${
            settings.theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'
          } backdrop-blur-md`}>
            <h3 className={`text-lg font-semibold mb-4 ${settings.theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
              Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({...settings, theme: e.target.value as 'light' | 'dark'})}
                  className={`w-full p-2 rounded-lg border ${
                    settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Font Size
                </label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => setSettings({...settings, fontSize: e.target.value as 'small' | 'medium' | 'large'})}
                  className={`w-full p-2 rounded-lg border ${
                    settings.theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Auto Advance (Quiz)
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoAdvance}
                    onChange={(e) => setSettings({...settings, autoAdvance: e.target.checked})}
                    className="mr-2"
                  />
                  <span className={`text-sm ${settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Auto advance after answer
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Sets List */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Your Sets ({sets.length})
              </h2>
              
              {sets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No flashcard sets yet</p>
                  <p className="text-sm">Create your first set to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sets.map(set => (
                    <div
                      key={set.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        activeSet?.id === set.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                      }`}
                      onClick={() => setActiveSet(set)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{set.name}</h3>
                          {set.description && (
                            <p className="text-sm text-gray-600 mt-1">{set.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{set.cards.length} cards</span>
                            {set.lastStudied && (
                              <span>Last studied: {set.lastStudied.toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSet(set.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Set Details */}
          <div className="lg:col-span-2">
            {!activeSet ? (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center">
                <div className="max-w-md mx-auto">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Select a Flashcard Set</h2>
                  <p className="text-gray-600 mb-6">Choose a set from the left panel or create a new one to get started.</p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="h-5 w-5 mr-2 inline" />
                    Create Your First Set
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Set Header */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{activeSet.name}</h2>
                      {activeSet.description && (
                        <p className="text-gray-600 mt-1">{activeSet.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {activeSet.cards.length > 0 && (
                        <>
                          <button
                            onClick={() => startStudy('flip', false)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              settings.theme === 'dark'
                                ? 'bg-green-900 text-green-300 hover:bg-green-800'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            <Play className="h-4 w-4 mr-2 inline" />
                            Study
                          </button>
                          <button
                            onClick={() => startStudy('quiz', false)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              settings.theme === 'dark'
                                ? 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            <Target className="h-4 w-4 mr-2 inline" />
                            Quiz
                          </button>
                          <button
                            onClick={() => startStudy('flip', true)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              settings.theme === 'dark'
                                ? 'bg-orange-900 text-orange-300 hover:bg-orange-800'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }`}
                          >
                            <Shuffle className="h-4 w-4 mr-2 inline" />
                            Shuffle
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  {activeSet.cards.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-blue-600">{activeSet.cards.length}</div>
                        <div className="text-sm text-blue-700">Total Cards</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-600">
                          {activeSet.cards.reduce((sum, card) => sum + card.correctCount, 0)}
                        </div>
                        <div className="text-sm text-green-700">Correct</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-red-600">
                          {activeSet.cards.reduce((sum, card) => sum + card.incorrectCount, 0)}
                        </div>
                        <div className="text-sm text-red-700">Incorrect</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add/Edit Card Form */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {isEditing ? 'Edit Card' : 'Add New Card'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Front (Question/Term)
                      </label>
                      <textarea
                        value={cardForm.front}
                        onChange={(e) => setCardForm({...cardForm, front: e.target.value})}
                        placeholder="Enter the question or term..."
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                          settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Back (Answer/Definition)
                      </label>
                      <textarea
                        value={cardForm.back}
                        onChange={(e) => setCardForm({...cardForm, back: e.target.value})}
                        placeholder="Enter the answer or definition..."
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                          settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={cardForm.tags}
                        onChange={(e) => setCardForm({...cardForm, tags: e.target.value})}
                        placeholder="e.g., biology, cell, mitochondria"
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Difficulty
                      </label>
                      <select
                        value={cardForm.difficulty}
                        onChange={(e) => setCardForm({...cardForm, difficulty: e.target.value as any})}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <div className="flex space-x-3">
                      {isEditing && (
                        <button
                          onClick={() => {
                            setIsEditing(null)
                            setCardForm({ front: '', back: '', difficulty: 'medium', tags: '' })
                          }}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            settings.theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={isEditing ? updateCard : addCard}
                        disabled={!cardForm.front.trim() || !cardForm.back.trim()}
                        className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          settings.theme === 'dark'
                            ? 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isEditing ? 'Update Card' : 'Add Card'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cards List */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Cards ({activeSet.cards.length})
                  </h3>
                  
                  {activeSet.cards.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No cards in this set yet</p>
                      <p className="text-sm">Add your first card above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeSet.cards.map((card, index) => (
                        <div key={card.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Front</div>
                              <div className="font-medium text-gray-800">{card.front}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Back</div>
                              <div className="text-gray-700">{card.back}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className={`px-2 py-1 rounded text-xs ${
                                card.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {card.difficulty}
                              </span>
                              <span className="flex items-center">
                                <Check className="h-3 w-3 text-green-500 mr-1" />
                                {card.correctCount}
                              </span>
                              <span className="flex items-center">
                                <X className="h-3 w-3 text-red-500 mr-1" />
                                {card.incorrectCount}
                              </span>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setIsEditing(card)
                                  setCardForm({
                                    front: card.front,
                                    back: card.back,
                                    difficulty: (card.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
                                    tags: card.tags ? card.tags.join(', ') : ''
                                  })
                                }}
                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteCard(card.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Set Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Flashcard Set</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Name *
                </label>
                <input
                  type="text"
                  value={newSetForm.name}
                  onChange={(e) => setNewSetForm({...newSetForm, name: e.target.value})}
                  placeholder="e.g., Biology Terms, Spanish Vocabulary"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newSetForm.description}
                  onChange={(e) => setNewSetForm({...newSetForm, description: e.target.value})}
                  placeholder="Brief description of this flashcard set..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsCreating(false)
                  setNewSetForm({ name: '', description: '', tags: '' })
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSet}
                disabled={!newSetForm.name.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Study Mode */}
      <StudyModeComponent />
      
      {/* CSS for 3D flip effect */}
      <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .rotate-y-0 {
          transform: rotateY(0deg);
        }
        @keyframes flip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }
        @keyframes flipBack {
          0% { transform: rotateY(180deg); }
          100% { transform: rotateY(0deg); }
        }
        .flip-animation {
          animation: flip 0.7s ease-in-out;
        }
        .flip-back-animation {
          animation: flipBack 0.7s ease-in-out;
        }
        /* Gradient animations */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
        }
        /* Hover effects */
        .card-hover:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        /* Pulse animation for interactive elements */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  )
}
