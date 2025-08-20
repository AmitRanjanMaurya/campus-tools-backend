'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Save, 
  Download, 
  ArrowLeft, 
  Edit3, 
  Eye, 
  EyeOff, 
  Tag, 
  Calendar, 
  Trash2, 
  Settings,
  Moon,
  Sun,
  FileText,
  Hash,
  Clock,
  Brain,
  Volume2,
  VolumeX,
  StickyNote,
  Camera,
  CreditCard,
  BarChart3,
  Users,
  Layout,
  Mic,
  MicOff,
  Play,
  Pause,
  Repeat,
  Upload,
  Image,
  Highlighter,
  ExternalLink,
  Bookmark,
  PenTool,
  Share2,
  MessageCircle,
  Zap,
  Target,
  BookOpen,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'

interface StickyNote {
  id: string
  content: string
  x: number
  y: number
  color: string
}

interface RevisionStats {
  timesOpened: number
  lastAccessed: string
  studyTime: number
  flashcardsGenerated: number
}

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  theme: 'light' | 'dark' | 'sepia' | 'solarized'
  lastModified: string
  createdAt: string
  template?: string
  stickyNotes: StickyNote[]
  revisionStats: RevisionStats
  sharedWith: string[]
  comments: Array<{
    id: string
    userId: string
    content: string
    timestamp: string
  }>
  highlights: Array<{
    id: string
    text: string
    position: number
    color: string
  }>
  linkedNotes: string[]
  isPublic: boolean
  summary?: string
  audioUrl?: string
}

type Theme = 'light' | 'dark' | 'sepia' | 'solarized'
type ViewMode = 'dashboard' | 'editor'
type EditorView = 'split' | 'write' | 'preview'

const THEME_CONFIGS = {
  light: {
    name: 'Light',
    bg: '#ffffff',
    text: 'text-secondary-900',
    border: 'border-secondary-200',
    accent: 'bg-primary-50 text-primary-900',
    cardBg: 'bg-white'
  },
  dark: {
    name: 'Dark',
    bg: '#1e293b',
    text: 'text-gray-100',
    border: 'border-gray-700',
    accent: 'bg-gray-800 text-gray-100',
    cardBg: 'bg-gray-800'
  },
  sepia: {
    name: 'Sepia',
    bg: '#fefce8',
    text: 'text-amber-900',
    border: 'border-amber-200',
    accent: 'bg-amber-100 text-amber-900',
    cardBg: 'bg-yellow-50'
  },
  solarized: {
    name: 'Solarized',
    bg: '#002b36',
    text: 'text-slate-100',
    border: 'border-slate-600',
    accent: 'bg-slate-700 text-slate-100',
    cardBg: 'bg-slate-800'
  }
}

export default function NotesOrganizer() {
  // State Management
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [editorView, setEditorView] = useState<EditorView>('split')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'tags'>('date')
  const [globalTheme, setGlobalTheme] = useState<Theme>('light')
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string>('')
  
  // New Feature States
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showStickyNotes, setShowStickyNotes] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false)
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false)
  const [showRevisionStats, setShowRevisionStats] = useState(false)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  
  // Refs for new features
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('student_notes')
    const savedTheme = localStorage.getItem('notes_theme') as Theme
    
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (error) {
        console.error('Error loading notes:', error)
      }
    }
    
    if (savedTheme) {
      setGlobalTheme(savedTheme)
    }
  }, [])

  // Auto-save functionality
  const saveNotes = useCallback((notesToSave: Note[]) => {
    try {
      localStorage.setItem('student_notes', JSON.stringify(notesToSave))
      localStorage.setItem('notes_theme', globalTheme)
      setLastSaved(new Date().toLocaleTimeString())
      setIsAutoSaving(false)
    } catch (error) {
      console.error('Error saving notes:', error)
      setIsAutoSaving(false)
    }
  }, [globalTheme])

  // Auto-save trigger
  useEffect(() => {
    if (notes.length > 0) {
      setIsAutoSaving(true)
      const timeoutId = setTimeout(() => {
        saveNotes(notes)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [notes, saveNotes])

  // Create new note
  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '# New Note\n\nStart writing your notes here...',
      tags: [],
      theme: globalTheme,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      stickyNotes: [],
      revisionStats: {
        timesOpened: 0,
        lastAccessed: new Date().toISOString(),
        studyTime: 0,
        flashcardsGenerated: 0
      },
      sharedWith: [],
      comments: [],
      highlights: [],
      linkedNotes: [],
      isPublic: false
    }
    
    setNotes(prev => [newNote, ...prev])
    setCurrentNote(newNote)
    setViewMode('editor')
  }

  // Update current note
  const updateCurrentNote = (updates: Partial<Note>) => {
    if (!currentNote) return

    const updatedNote = {
      ...currentNote,
      ...updates,
      lastModified: new Date().toISOString()
    }

    setCurrentNote(updatedNote)
    setNotes(prev => prev.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ))
  }

  // Delete note
  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
    if (currentNote?.id === noteId) {
      setCurrentNote(null)
      setViewMode('dashboard')
    }
  }

  // Filter and search notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => note.tags.includes(tag))
    
    return matchesSearch && matchesTags
  })

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'tags':
        return a.tags.join(',').localeCompare(b.tags.join(','))
      case 'date':
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    }
  })

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)))

  // Parse markdown to HTML (simple implementation)
  const parseMarkdown = (markdown: string): string => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4 overflow-x-auto"><code>$1</code></pre>')
      .replace(/`([^`]*)`/gim, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">$1</code>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      // Line breaks
      .replace(/\n/gim, '<br>')
  }

  // Export note as markdown
  const exportAsMarkdown = (note: Note) => {
    const blob = new Blob([note.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export note as text
  const exportAsText = (note: Note) => {
    const blob = new Blob([note.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 🧠 AI Summarizer
  const generateAISummary = async (note: Note) => {
    if (!note.content.trim()) return
    
    // Simple extractive summarization (in a real app, you'd use an API)
    const sentences = note.content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const summary = sentences.slice(0, 3).join('. ') + '.'
    
    updateCurrentNote({ summary })
  }

  // 🔊 Text-to-Speech
  const toggleTextToSpeech = () => {
    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      if (!currentNote?.content) return
      
      const utterance = new SpeechSynthesisUtterance(currentNote.content)
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesisRef.current = utterance
      speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  // 📌 Sticky Notes
  const addStickyNote = () => {
    if (!currentNote) return
    
    const newStickyNote: StickyNote = {
      id: Date.now().toString(),
      content: 'New sticky note',
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 100,
      color: '#fef08a'
    }
    
    updateCurrentNote({
      stickyNotes: [...(currentNote.stickyNotes || []), newStickyNote]
    })
  }

  // 📚 Flashcard Generator
  const generateFlashcards = async (note: Note) => {
    setIsGeneratingFlashcards(true)
    
    // Extract highlighted text or key terms
    const highlights = note.highlights || []
    const flashcards = highlights.map(highlight => ({
      question: `What is ${highlight.text}?`,
      answer: highlight.text,
      noteId: note.id
    }))
    
    // In a real app, save to flashcards collection
    localStorage.setItem('generated_flashcards', JSON.stringify(flashcards))
    
    updateCurrentNote({
      revisionStats: {
        ...note.revisionStats,
        flashcardsGenerated: flashcards.length
      }
    })
    
    setIsGeneratingFlashcards(false)
    alert(`Generated ${flashcards.length} flashcards! Check your flashcard tool.`)
  }

  // 📈 Revision Tracker
  const updateRevisionStats = (note: Note) => {
    const stats = note.revisionStats || {
      timesOpened: 0,
      lastAccessed: new Date().toISOString(),
      studyTime: 0,
      flashcardsGenerated: 0
    }
    
    updateCurrentNote({
      revisionStats: {
        ...stats,
        timesOpened: stats.timesOpened + 1,
        lastAccessed: new Date().toISOString()
      }
    })
  }

  // 📷 OCR Image Processing
  const processImageToText = async (file: File) => {
    setIsProcessingOCR(true)
    
    // Simulate OCR processing (in a real app, use Tesseract.js or API)
    const reader = new FileReader()
    reader.onload = () => {
      const extractedText = `\n\n## Extracted from Image\n\n[Image content would be converted to text here]\n\nProcessed on: ${new Date().toLocaleString()}\n\n`
      
      if (currentNote) {
        updateCurrentNote({
          content: currentNote.content + extractedText
        })
      }
      setIsProcessingOCR(false)
    }
    reader.readAsDataURL(file)
  }

  // 👥 Share Note
  const shareNote = (note: Note, userId: string) => {
    const updatedSharedWith = [...(note.sharedWith || []), userId]
    updateCurrentNote({ sharedWith: updatedSharedWith })
  }

  // 🧩 Note Templates
  const NOTE_TEMPLATES = {
    lecture: `# Lecture Notes - [Subject]\n\n**Date:** ${new Date().toLocaleDateString()}\n**Topic:** \n\n## Key Points\n- \n- \n- \n\n## Details\n\n\n## Questions/Follow-up\n- \n\n## Summary\n`,
    
    definition: `# Definition Notes\n\n## Term: [Term Name]\n\n**Definition:** \n\n**Context:** \n\n**Examples:**\n- \n- \n\n**Related Terms:**\n- \n\n**Applications:**\n- \n`,
    
    lab: `# Lab Report - [Experiment Name]\n\n**Date:** ${new Date().toLocaleDateString()}\n**Objective:** \n\n## Hypothesis\n\n\n## Materials\n- \n- \n\n## Procedure\n1. \n2. \n3. \n\n## Observations\n\n\n## Results\n\n\n## Conclusion\n\n\n## Questions\n1. \n`,
    
    study: `# Study Guide - [Topic]\n\n## Important Concepts\n- [ ] \n- [ ] \n- [ ] \n\n## Formulas/Equations\n\n\n## Practice Problems\n1. \n2. \n3. \n\n## Memory Aids\n\n\n## Review Schedule\n- [ ] Day 1: \n- [ ] Day 3: \n- [ ] Day 7: \n- [ ] Day 14: \n`
  }

  const applyTemplate = (templateKey: string) => {
    if (!currentNote) return
    
    const template = NOTE_TEMPLATES[templateKey as keyof typeof NOTE_TEMPLATES]
    if (template) {
      updateCurrentNote({
        content: template,
        template: templateKey
      })
    }
  }

  const themeConfig = THEME_CONFIGS[globalTheme]

  return (
    <div className={`min-h-screen transition-colors duration-300`} 
         style={{ backgroundColor: globalTheme === 'light' ? '#f1f9fe' : themeConfig.bg }}>
      {viewMode === 'dashboard' && (
        <NoteDashboard
          notes={sortedNotes}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          allTags={allTags}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onCreateNote={createNewNote}
          onEditNote={(note) => {
            setCurrentNote(note)
            setViewMode('editor')
          }}
          onDeleteNote={deleteNote}
          theme={globalTheme}
          onThemeChange={setGlobalTheme}
          lastSaved={lastSaved}
          isAutoSaving={isAutoSaving}
        />
      )}

      {viewMode === 'editor' && currentNote && (
        <NoteEditor
          note={currentNote}
          onUpdateNote={updateCurrentNote}
          onBackToDashboard={() => setViewMode('dashboard')}
          editorView={editorView}
          setEditorView={setEditorView}
          onExportMarkdown={() => exportAsMarkdown(currentNote)}
          onExportText={() => exportAsText(currentNote)}
          parseMarkdown={parseMarkdown}
          theme={globalTheme}
          lastSaved={lastSaved}
          isAutoSaving={isAutoSaving}
          // New feature props
          onGenerateAISummary={() => generateAISummary(currentNote)}
          onToggleTextToSpeech={toggleTextToSpeech}
          isSpeaking={isSpeaking}
          onAddStickyNote={addStickyNote}
          showStickyNotes={showStickyNotes}
          setShowStickyNotes={setShowStickyNotes}
          onGenerateFlashcards={() => generateFlashcards(currentNote)}
          isGeneratingFlashcards={isGeneratingFlashcards}
          onProcessImageToText={processImageToText}
          isProcessingOCR={isProcessingOCR}
          onApplyTemplate={applyTemplate}
          noteTemplates={NOTE_TEMPLATES}
          showAdvancedFeatures={showAdvancedFeatures}
          setShowAdvancedFeatures={setShowAdvancedFeatures}
          onUpdateRevisionStats={() => updateRevisionStats(currentNote)}
        />
      )}
    </div>
  )
}

// Dashboard Component
interface NoteDashboardProps {
  notes: Note[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedTags: string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
  allTags: string[]
  sortBy: 'date' | 'title' | 'tags'
  setSortBy: (sort: 'date' | 'title' | 'tags') => void
  onCreateNote: () => void
  onEditNote: (note: Note) => void
  onDeleteNote: (noteId: string) => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
  lastSaved: string
  isAutoSaving: boolean
}

function NoteDashboard({
  notes,
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
  allTags,
  sortBy,
  setSortBy,
  onCreateNote,
  onEditNote,
  onDeleteNote,
  theme,
  onThemeChange,
  lastSaved,
  isAutoSaving
}: NoteDashboardProps) {
  const themeConfig = THEME_CONFIGS[theme]

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-primary-600 hover:text-primary-800 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tools
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {lastSaved && (
            <span className="text-sm text-secondary-500">
              {isAutoSaving ? 'Saving...' : `Last saved: ${lastSaved}`}
            </span>
          )}
          
          {/* Theme Selector */}
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as Theme)}
            className={`input-field min-w-32`}
          >
            {Object.entries(THEME_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-secondary-900">📚 Notes Organizer</h1>
        <p className="text-lg text-secondary-600">Create, organize, and manage your study notes with markdown support</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <button
          onClick={onCreateNote}
          className="btn-primary flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Note
        </button>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="input-field min-w-40"
        >
          <option value="date">Sort by Date</option>
          <option value="title">Sort by Title</option>
          <option value="tags">Sort by Tags</option>
        </select>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center text-secondary-900">
            <Filter className="h-5 w-5 mr-2" />
            Filter by Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 mx-auto mb-4 text-secondary-400" />
          <h3 className="text-xl font-semibold mb-2 text-secondary-900">No notes yet</h3>
          <p className="text-secondary-600 mb-6">Create your first note to get started</p>
          <button
            onClick={onCreateNote}
            className="btn-primary"
          >
            Create Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => onEditNote(note)}
              onDelete={() => onDeleteNote(note.id)}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Note Card Component
interface NoteCardProps {
  note: Note
  onEdit: () => void
  onDelete: () => void
  theme: Theme
}

function NoteCard({ note, onEdit, onDelete, theme }: NoteCardProps) {
  const themeConfig = THEME_CONFIGS[theme]

  return (
    <div className={`card hover:shadow-lg transition-all duration-300 transform hover:scale-105 relative`}
         style={{ backgroundColor: theme === 'light' ? '#ffffff' : themeConfig.cardBg }}>
      
      {/* Template Badge */}
      {note.template && (
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center">
            <Layout className="h-3 w-3 mr-1" />
            {note.template}
          </span>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-xl font-semibold ${themeConfig.text} truncate pr-20`}>
          {note.title}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Enhanced Stats Row */}
      <div className="flex items-center justify-between text-sm text-secondary-600 mb-3">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(note.lastModified).toLocaleDateString()}
          </span>
          {note.revisionStats && (
            <>
              <span className="flex items-center text-blue-600">
                <Eye className="h-4 w-4 mr-1" />
                {note.revisionStats.timesOpened}
              </span>
              {note.revisionStats.flashcardsGenerated > 0 && (
                <span className="flex items-center text-orange-600">
                  <CreditCard className="h-4 w-4 mr-1" />
                  {note.revisionStats.flashcardsGenerated}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* AI Summary Preview */}
      {note.summary && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-1 mb-1">
            <Brain className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">AI Summary</span>
          </div>
          <p className="text-xs text-blue-600 line-clamp-2">{note.summary}</p>
        </div>
      )}

      {/* Content Preview */}
      <p className={`${themeConfig.text} text-sm mb-4 line-clamp-3`}>
        {note.content.replace(/[#*`]/g, '').substring(0, 150)}
        {note.content.length > 150 ? '...' : ''}
      </p>

      {/* Enhanced Features Row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs flex items-center"
            >
              <Hash className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="px-2 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs">
              +{note.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Feature Indicators */}
        <div className="flex items-center space-x-1">
          {note.stickyNotes && note.stickyNotes.length > 0 && (
            <div className="flex items-center text-yellow-600" title={`${note.stickyNotes.length} sticky notes`}>
              <StickyNote className="h-3 w-3" />
              <span className="text-xs ml-1">{note.stickyNotes.length}</span>
            </div>
          )}
          {note.highlights && note.highlights.length > 0 && (
            <div className="flex items-center text-orange-600" title={`${note.highlights.length} highlights`}>
              <Highlighter className="h-3 w-3" />
              <span className="text-xs ml-1">{note.highlights.length}</span>
            </div>
          )}
          {note.linkedNotes && note.linkedNotes.length > 0 && (
            <div className="flex items-center text-green-600" title={`${note.linkedNotes.length} linked notes`}>
              <ExternalLink className="h-3 w-3" />
              <span className="text-xs ml-1">{note.linkedNotes.length}</span>
            </div>
          )}
          {note.sharedWith && note.sharedWith.length > 0 && (
            <div className="flex items-center text-purple-600" title={`Shared with ${note.sharedWith.length} people`}>
              <Users className="h-3 w-3" />
              <span className="text-xs ml-1">{note.sharedWith.length}</span>
            </div>
          )}
          {note.isPublic && (
            <div className="flex items-center text-indigo-600" title="Public note">
              <Share2 className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Note Editor Component
interface NoteEditorProps {
  note: Note
  onUpdateNote: (updates: Partial<Note>) => void
  onBackToDashboard: () => void
  editorView: EditorView
  setEditorView: (view: EditorView) => void
  onExportMarkdown: () => void
  onExportText: () => void
  parseMarkdown: (markdown: string) => string
  theme: Theme
  lastSaved: string
  isAutoSaving: boolean
  // New feature props
  onGenerateAISummary: () => void
  onToggleTextToSpeech: () => void
  isSpeaking: boolean
  onAddStickyNote: () => void
  showStickyNotes: boolean
  setShowStickyNotes: (show: boolean) => void
  onGenerateFlashcards: () => void
  isGeneratingFlashcards: boolean
  onProcessImageToText: (file: File) => void
  isProcessingOCR: boolean
  onApplyTemplate: (template: string) => void
  noteTemplates: Record<string, string>
  showAdvancedFeatures: boolean
  setShowAdvancedFeatures: (show: boolean) => void
  onUpdateRevisionStats: () => void
}

function NoteEditor({
  note,
  onUpdateNote,
  onBackToDashboard,
  editorView,
  setEditorView,
  onExportMarkdown,
  onExportText,
  parseMarkdown,
  theme,
  lastSaved,
  isAutoSaving,
  // New feature props
  onGenerateAISummary,
  onToggleTextToSpeech,
  isSpeaking,
  onAddStickyNote,
  showStickyNotes,
  setShowStickyNotes,
  onGenerateFlashcards,
  isGeneratingFlashcards,
  onProcessImageToText,
  isProcessingOCR,
  onApplyTemplate,
  noteTemplates,
  showAdvancedFeatures,
  setShowAdvancedFeatures,
  onUpdateRevisionStats
}: NoteEditorProps) {
  const [newTag, setNewTag] = useState('')
  const themeConfig = THEME_CONFIGS[theme]

  const addTag = () => {
    if (newTag.trim() && !note.tags.includes(newTag.trim())) {
      onUpdateNote({ tags: [...note.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    onUpdateNote({ tags: note.tags.filter(t => t !== tag) })
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: theme === 'light' ? '#f1f9fe' : themeConfig.bg }}>
      {/* Header */}
      <div className={`bg-white border-b border-secondary-200 px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Notes
            </button>
            
            <input
              type="text"
              value={note.title}
              onChange={(e) => onUpdateNote({ title: e.target.value })}
              className="text-2xl font-bold bg-transparent text-secondary-900 border-none outline-none focus:ring-2 focus:ring-primary-500 rounded px-2"
            />
          </div>

          <div className="flex items-center space-x-4">
            {lastSaved && (
              <span className="text-sm text-secondary-500">
                {isAutoSaving ? 'Saving...' : `Saved: ${lastSaved}`}
              </span>
            )}

            {/* View Toggle */}
            <div className="flex bg-secondary-100 rounded-lg p-1">
              <button
                onClick={() => setEditorView('write')}
                className={`px-3 py-1 rounded transition-colors ${editorView === 'write' ? 'bg-white shadow-sm text-primary-600' : 'text-secondary-600 hover:text-secondary-900'}`}
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setEditorView('split')}
                className={`px-3 py-1 rounded transition-colors ${editorView === 'split' ? 'bg-white shadow-sm text-primary-600' : 'text-secondary-600 hover:text-secondary-900'}`}
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => setEditorView('preview')}
                className={`px-3 py-1 rounded transition-colors ${editorView === 'preview' ? 'bg-white shadow-sm text-primary-600' : 'text-secondary-600 hover:text-secondary-900'}`}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>

            {/* Export Options */}
            <div className="flex space-x-2">
              <button
                onClick={onExportMarkdown}
                className="btn-primary"
              >
                Export .md
              </button>
              <button
                onClick={onExportText}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Export .txt
              </button>
            </div>

            {/* Advanced Features Toggle */}
            <button
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center"
            >
              <Zap className="h-4 w-4 mr-1" />
              AI Tools
            </button>
          </div>
        </div>

        {/* Advanced Features Panel */}
        {showAdvancedFeatures && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {/* AI Summarizer */}
              <button
                onClick={onGenerateAISummary}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <Brain className="h-4 w-4" />
                <span>Summarize</span>
              </button>

              {/* Text-to-Speech */}
              <button
                onClick={onToggleTextToSpeech}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  isSpeaking 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>{isSpeaking ? 'Stop' : 'Read'}</span>
              </button>

              {/* Sticky Notes */}
              <button
                onClick={onAddStickyNote}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
              >
                <StickyNote className="h-4 w-4" />
                <span>Sticky</span>
              </button>

              {/* Flashcards */}
              <button
                onClick={onGenerateFlashcards}
                disabled={isGeneratingFlashcards}
                className="flex items-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                <span>{isGeneratingFlashcards ? 'Creating...' : 'Flashcards'}</span>
              </button>

              {/* OCR Image Upload */}
              <label className="flex items-center space-x-2 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm cursor-pointer">
                <Camera className="h-4 w-4" />
                <span>{isProcessingOCR ? 'Processing...' : 'OCR'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && onProcessImageToText(e.target.files[0])}
                  className="hidden"
                  disabled={isProcessingOCR}
                />
              </label>

              {/* Templates */}
              <select
                onChange={(e) => e.target.value && onApplyTemplate(e.target.value)}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                defaultValue=""
              >
                <option value="">Templates</option>
                {Object.entries(noteTemplates).map(([key, template]) => (
                  <option key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Revision Stats */}
            {note.revisionStats && (
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Opened: {note.revisionStats.timesOpened} times</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CreditCard className="h-4 w-4" />
                  <span>Flashcards: {note.revisionStats.flashcardsGenerated}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Last accessed: {new Date(note.revisionStats.lastAccessed).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags Section */}
        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <Tag className="h-4 w-4 text-secondary-600" />
            <span className="font-medium text-secondary-900">Tags:</span>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add tag..."
              className="input-field text-sm py-1 px-2 min-w-32"
            />
            <button
              onClick={addTag}
              className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {note.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-sm flex items-center"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex relative">
        {/* Sticky Notes Overlay */}
        {showStickyNotes && note.stickyNotes && note.stickyNotes.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {note.stickyNotes.map(sticky => (
              <div
                key={sticky.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${sticky.x}px`,
                  top: `${sticky.y}px`,
                  backgroundColor: sticky.color,
                  transform: 'rotate(-2deg)'
                }}
              >
                <div className="w-32 h-32 p-2 rounded-lg shadow-lg border-2 border-yellow-200">
                  <textarea
                    value={sticky.content}
                    onChange={(e) => {
                      const updatedStickies = note.stickyNotes.map(s =>
                        s.id === sticky.id ? { ...s, content: e.target.value } : s
                      )
                      onUpdateNote({ stickyNotes: updatedStickies })
                    }}
                    className="w-full h-full bg-transparent text-xs resize-none border-none outline-none"
                    placeholder="Sticky note..."
                  />
                  <button
                    onClick={() => {
                      const updatedStickies = note.stickyNotes.filter(s => s.id !== sticky.id)
                      onUpdateNote({ stickyNotes: updatedStickies })
                    }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(editorView === 'write' || editorView === 'split') && (
          <div className={`${editorView === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <div className={`${themeConfig.bg} ${themeConfig.border} border-b px-4 py-2 flex items-center justify-between`}>
              <h3 className="font-medium">Markdown Editor</h3>
              <button
                onClick={() => setShowStickyNotes(!showStickyNotes)}
                className={`px-2 py-1 rounded text-sm ${showStickyNotes ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-600'} hover:bg-yellow-300 transition-colors`}
              >
                <StickyNote className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={note.content}
              onChange={(e) => onUpdateNote({ content: e.target.value })}
              onClick={onUpdateRevisionStats}
              className={`flex-1 p-6 resize-none ${themeConfig.bg} ${themeConfig.text} border-none outline-none font-mono`}
              placeholder="Start writing your note in markdown..."
            />
          </div>
        )}

        {(editorView === 'preview' || editorView === 'split') && (
          <div className={`${editorView === 'split' ? 'w-1/2 border-l' : 'w-full'} ${themeConfig.border} flex flex-col`}>
            <div className={`${themeConfig.bg} ${themeConfig.border} border-b px-4 py-2`}>
              <h3 className="font-medium">Live Preview</h3>
            </div>
            
            {/* AI Summary Section */}
            {note.summary && (
              <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">AI Summary</span>
                </div>
                <p className="text-sm text-blue-700">{note.summary}</p>
              </div>
            )}

            {/* Highlights Section */}
            {note.highlights && note.highlights.length > 0 && (
              <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Highlighter className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-orange-800">Highlights ({note.highlights.length})</span>
                </div>
                <div className="space-y-1">
                  {note.highlights.map(highlight => (
                    <div key={highlight.id} className="text-sm p-2 rounded" style={{ backgroundColor: highlight.color }}>
                      {highlight.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Notes Section */}
            {note.linkedNotes && note.linkedNotes.length > 0 && (
              <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <ExternalLink className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">Linked Notes ({note.linkedNotes.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {note.linkedNotes.map(linkedId => (
                    <span key={linkedId} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                      @{linkedId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div
              className={`flex-1 p-6 overflow-y-auto ${themeConfig.text} prose prose-lg max-w-none`}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(note.content) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
