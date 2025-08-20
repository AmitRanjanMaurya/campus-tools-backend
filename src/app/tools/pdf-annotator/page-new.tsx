'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui'
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Eye, 
  EyeOff,
  Search,
  Highlighter,
  MessageSquare,
  Bookmark,
  Brain,
  Zap,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Plus,
  X,
  Save,
  Edit
} from 'lucide-react'

interface Annotation {
  id: string
  type: 'highlight' | 'comment' | 'bookmark'
  page: number
  position: { x: number; y: number; width?: number; height?: number }
  content: string
  color: string
  tags: string[]
  timestamp: string
  text?: string
}

interface PDFFile {
  id: string
  name: string
  url: string
  uploadDate: string
  annotations: Annotation[]
  lastModified: string
  size: number
}

const PDFAnnotator = () => {
  const { user } = useAuth()
  const [pdfs, setPdfs] = useState<PDFFile[]>([])
  const [activePdf, setActivePdf] = useState<PDFFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [selectedTool, setSelectedTool] = useState<'select' | 'highlight' | 'comment' | 'bookmark'>('select')
  const [selectedColor, setSelectedColor] = useState('#FFD700')
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null)
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(true)
  const [annotationFilter, setAnnotationFilter] = useState<'all' | 'highlight' | 'comment' | 'bookmark'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [commentText, setCommentText] = useState('')
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<{start: {x: number, y: number}, end: {x: number, y: number}} | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfViewerRef = useRef<HTMLDivElement>(null)

  // Load saved PDFs on component mount
  useEffect(() => {
    const savedPdfs = localStorage.getItem('student_tools_pdfs')
    if (savedPdfs) {
      try {
        const parsedPdfs = JSON.parse(savedPdfs)
        setPdfs(parsedPdfs)
      } catch (error) {
        console.error('Error loading saved PDFs:', error)
        localStorage.removeItem('student_tools_pdfs')
      }
    }
  }, [])

  // Save PDFs to localStorage whenever pdfs state changes
  useEffect(() => {
    if (pdfs.length > 0) {
      localStorage.setItem('student_tools_pdfs', JSON.stringify(pdfs))
    } else {
      localStorage.removeItem('student_tools_pdfs')
    }
  }, [pdfs])

  // Load annotations for active PDF
  useEffect(() => {
    if (activePdf) {
      setAnnotations(activePdf.annotations || [])
    } else {
      setAnnotations([])
    }
  }, [activePdf])

  const colors = [
    { name: 'Yellow', value: '#FFD700' },
    { name: 'Green', value: '#90EE90' },
    { name: 'Blue', value: '#87CEEB' },
    { name: 'Pink', value: '#FFB6C1' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Purple', value: '#DDA0DD' },
    { name: 'Red', value: '#FF6B6B' },
    { name: 'Cyan', value: '#40E0D0' }
  ]

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.')
      return
    }

    setIsUploading(true)
    
    try {
      const fileUrl = URL.createObjectURL(file)
      
      const newPdf: PDFFile = {
        id: Date.now().toString(),
        name: file.name,
        url: fileUrl,
        uploadDate: new Date().toISOString(),
        annotations: [],
        lastModified: new Date().toISOString(),
        size: file.size
      }

      setPdfs(prev => [newPdf, ...prev])
      setActivePdf(newPdf)
      setAnnotations([])
      setCurrentPage(1)
      
      // Simulate PDF processing
      setTimeout(() => {
        setTotalPages(Math.floor(Math.random() * 50) + 10)
        setIsUploading(false)
        alert(`PDF "${file.name}" uploaded successfully! You can now start annotating.`)
      }, 1500)
      
    } catch (error) {
      console.error('Error uploading PDF:', error)
      alert('Error uploading PDF. Please try again.')
      setIsUploading(false)
    }

    // Reset file input
    if (event.target) {
      event.target.value = ''
    }
  }

  const handleDeletePdf = (pdfId: string) => {
    const pdfToDelete = pdfs.find(pdf => pdf.id === pdfId)
    if (!pdfToDelete) return

    const confirmDelete = window.confirm(`Are you sure you want to delete "${pdfToDelete.name}"? This action cannot be undone.`)
    
    if (confirmDelete) {
      // Revoke object URL to free memory
      URL.revokeObjectURL(pdfToDelete.url)
      
      setPdfs(prev => prev.filter(pdf => pdf.id !== pdfId))
      
      // If the deleted PDF was active, clear the active PDF
      if (activePdf?.id === pdfId) {
        setActivePdf(null)
        setAnnotations([])
        setCurrentPage(1)
      }

      alert(`PDF "${pdfToDelete.name}" has been deleted.`)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedTool === 'highlight' || selectedTool === 'comment') {
      const rect = pdfViewerRef.current?.getBoundingClientRect()
      if (rect) {
        setIsSelecting(true)
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setSelection({ start: { x, y }, end: { x, y } })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selection) {
      const rect = pdfViewerRef.current?.getBoundingClientRect()
      if (rect) {
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setSelection(prev => prev ? { ...prev, end: { x, y } } : null)
      }
    }
  }

  const handleMouseUp = () => {
    if (isSelecting && selection) {
      const width = Math.abs(selection.end.x - selection.start.x)
      const height = Math.abs(selection.end.y - selection.start.y)
      
      if (width > 10 && height > 10) {
        if (selectedTool === 'comment') {
          setShowCommentDialog(true)
        } else if (selectedTool === 'highlight') {
          addAnnotation('highlight', 'Selected text highlighted')
        }
      }
      
      setIsSelecting(false)
      setSelection(null)
    }
  }

  const addAnnotation = (type: 'highlight' | 'comment' | 'bookmark', content: string) => {
    if (!activePdf || !selection) return

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type,
      page: currentPage,
      position: {
        x: Math.min(selection.start.x, selection.end.x),
        y: Math.min(selection.start.y, selection.end.y),
        width: Math.abs(selection.end.x - selection.start.x),
        height: Math.abs(selection.end.y - selection.start.y)
      },
      content,
      color: selectedColor,
      tags: [],
      timestamp: new Date().toISOString(),
      text: type === 'highlight' ? 'Selected text' : undefined
    }

    const updatedAnnotations = [...annotations, newAnnotation]
    setAnnotations(updatedAnnotations)

    // Update the PDF with new annotations
    const updatedPdf = { ...activePdf, annotations: updatedAnnotations, lastModified: new Date().toISOString() }
    setActivePdf(updatedPdf)
    setPdfs(prev => prev.map(pdf => pdf.id === activePdf.id ? updatedPdf : pdf))

    setSelection(null)
  }

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      addAnnotation('comment', commentText.trim())
      setCommentText('')
      setShowCommentDialog(false)
    }
  }

  const deleteAnnotation = (annotationId: string) => {
    const updatedAnnotations = annotations.filter(ann => ann.id !== annotationId)
    setAnnotations(updatedAnnotations)

    if (activePdf) {
      const updatedPdf = { ...activePdf, annotations: updatedAnnotations, lastModified: new Date().toISOString() }
      setActivePdf(updatedPdf)
      setPdfs(prev => prev.map(pdf => pdf.id === activePdf.id ? updatedPdf : pdf))
    }
  }

  const addBookmark = () => {
    if (!activePdf) return

    const bookmarkName = prompt('Enter bookmark name:')
    if (!bookmarkName) return

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: 'bookmark',
      page: currentPage,
      position: { x: 20, y: 20 },
      content: bookmarkName,
      color: '#FF6B6B',
      tags: [],
      timestamp: new Date().toISOString()
    }

    const updatedAnnotations = [...annotations, newAnnotation]
    setAnnotations(updatedAnnotations)

    const updatedPdf = { ...activePdf, annotations: updatedAnnotations, lastModified: new Date().toISOString() }
    setActivePdf(updatedPdf)
    setPdfs(prev => prev.map(pdf => pdf.id === activePdf.id ? updatedPdf : pdf))
  }

  const exportAnnotations = () => {
    if (!activePdf || annotations.length === 0) {
      alert('No annotations to export.')
      return
    }

    const exportData = {
      pdfName: activePdf.name,
      exportDate: new Date().toISOString(),
      annotations: annotations.map(ann => ({
        type: ann.type,
        page: ann.page,
        content: ann.content,
        timestamp: ann.timestamp,
        color: ann.color
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activePdf.name}_annotations.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredAnnotations = annotations.filter(annotation => {
    const matchesFilter = annotationFilter === 'all' || annotation.type === annotationFilter
    const matchesSearch = !searchQuery || 
      annotation.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      annotation.text?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

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
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access the PDF Annotator and manage your documents.</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Annotator</h1>
          <p className="text-gray-600">
            Upload your PDF files to annotate, highlight, and organize your study materials.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - PDF Library */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">PDF Library</h3>
                <span className="text-sm text-gray-500">({pdfs.length})</span>
              </div>

              {/* Upload Button */}
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload PDF'}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* PDF List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pdfs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm font-medium">No PDFs uploaded yet</p>
                    <p className="text-gray-400 text-xs mt-1">Click "Upload PDF" to get started</p>
                  </div>
                ) : (
                  pdfs.map(pdf => (
                    <div
                      key={pdf.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        activePdf?.id === pdf.id 
                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setActivePdf(pdf)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate" title={pdf.name}>
                            {pdf.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{formatFileSize(pdf.size)}</p>
                          <p className="text-xs text-gray-400">
                            {pdf.annotations.length} annotation{pdf.annotations.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(pdf.uploadDate)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePdf(pdf.id)
                          }}
                          className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="flex gap-6">
              {/* PDF Viewer */}
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Toolbar */}
                  {activePdf && (
                    <div className="border-b border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <h3 className="font-medium text-gray-900">{activePdf.name}</h3>
                          <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Annotation Tools */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Tools:</span>
                          {[
                            { id: 'select', label: 'Select', icon: null },
                            { id: 'highlight', label: 'Highlight', icon: Highlighter },
                            { id: 'comment', label: 'Comment', icon: MessageSquare },
                          ].map(tool => (
                            <Button
                              key={tool.id}
                              size="sm"
                              variant={selectedTool === tool.id ? 'primary' : 'outline'}
                              onClick={() => setSelectedTool(tool.id as any)}
                              className={selectedTool === tool.id ? 'bg-blue-600 text-white' : ''}
                            >
                              {tool.icon && <tool.icon className="w-4 h-4 mr-1" />}
                              {tool.label}
                            </Button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Color:</span>
                          <div className="flex gap-1">
                            {colors.slice(0, 4).map(color => (
                              <button
                                key={color.value}
                                onClick={() => setSelectedColor(color.value)}
                                className={`w-6 h-6 rounded border-2 ${
                                  selectedColor === color.value ? 'border-gray-900' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={addBookmark}
                        >
                          <Bookmark className="w-4 h-4 mr-1" />
                          Bookmark
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={exportAnnotations}
                          disabled={annotations.length === 0}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* PDF Content */}
                  <div className="p-4">
                    {activePdf ? (
                      <div 
                        ref={pdfViewerRef}
                        className="relative bg-white border border-gray-200 rounded-lg overflow-hidden cursor-crosshair"
                        style={{ 
                          height: '600px', 
                          transform: `scale(${zoom / 100})`, 
                          transformOrigin: 'top left',
                          cursor: selectedTool === 'select' ? 'default' : 'crosshair'
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                      >
                        {/* Uploaded PDF Notice */}
                        <div className="absolute top-0 left-0 right-0 bg-blue-100 border-b border-blue-200 p-3 z-10">
                          <div className="flex items-center gap-2 text-blue-800 text-sm">
                            <FileText className="w-4 h-4" />
                            <span>PDF loaded: <strong>{activePdf.name}</strong></span>
                            <span className="text-blue-600">
                              (Demo mode - Use annotation tools to add highlights and comments)
                            </span>
                          </div>
                        </div>

                        {/* Demo Content Area */}
                        <div className="w-full h-full bg-white pt-16 p-8 text-gray-800 leading-relaxed">
                          <div className="max-w-2xl">
                            <h1 className="text-2xl font-bold mb-6 text-center">
                              {activePdf.name.replace('.pdf', '')}
                            </h1>
                            <p className="mb-4 text-gray-600">
                              This is a demonstration of the PDF Annotator tool. In a full implementation, 
                              your actual PDF content would be displayed here using a PDF rendering library.
                            </p>
                            <h2 className="text-xl font-semibold mb-4">How to use:</h2>
                            <ul className="list-disc pl-6 mb-6 space-y-2">
                              <li>Select the <strong>Highlight</strong> tool and drag to highlight text</li>
                              <li>Select the <strong>Comment</strong> tool and drag to add comments</li>
                              <li>Click <strong>Bookmark</strong> to bookmark this page</li>
                              <li>Use different colors for organizing your annotations</li>
                              <li>All annotations are automatically saved</li>
                            </ul>
                            <p className="text-gray-600 mb-4">
                              Try selecting some text above with the highlight or comment tools!
                            </p>
                            <div className="bg-gray-100 p-4 rounded-lg">
                              <p className="text-sm text-gray-600">
                                <strong>Note:</strong> This is page {currentPage} of {totalPages}. 
                                Use the navigation buttons to move between pages.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Annotations Overlay */}
                        {filteredAnnotations
                          .filter(ann => ann.page === currentPage)
                          .map(annotation => (
                            <div
                              key={annotation.id}
                              className="absolute border-2 border-dashed opacity-75 hover:opacity-100 cursor-pointer"
                              style={{
                                left: annotation.position.x,
                                top: annotation.position.y,
                                width: annotation.position.width || 20,
                                height: annotation.position.height || 20,
                                borderColor: annotation.color,
                                backgroundColor: annotation.type === 'highlight' ? annotation.color + '40' : 'transparent'
                              }}
                              onClick={() => setSelectedAnnotation(annotation)}
                              title={annotation.content}
                            >
                              {annotation.type === 'comment' && (
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                              )}
                              {annotation.type === 'bookmark' && (
                                <Bookmark className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          ))}

                        {/* Selection Overlay */}
                        {isSelecting && selection && (
                          <div
                            className="absolute border-2 border-blue-500 bg-blue-200 opacity-30"
                            style={{
                              left: Math.min(selection.start.x, selection.end.x),
                              top: Math.min(selection.start.y, selection.end.y),
                              width: Math.abs(selection.end.x - selection.start.x),
                              height: Math.abs(selection.end.y - selection.start.y)
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg mb-2 font-medium">No PDF selected</p>
                          <p className="mb-4">Upload your first PDF file to start annotating and studying</p>
                          <Button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isUploading}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploading ? 'Uploading...' : 'Upload Your First PDF'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Annotations Sidebar */}
              {showAnnotationPanel && activePdf && (
                <div className="w-80 flex-shrink-0">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Annotations</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAnnotationPanel(false)}
                      >
                        <EyeOff className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="space-y-3 mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search annotations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      
                      <div className="flex gap-1">
                        {['all', 'highlight', 'comment', 'bookmark'].map(filter => (
                          <Button
                            key={filter}
                            size="sm"
                            variant={annotationFilter === filter ? 'primary' : 'outline'}
                            onClick={() => setAnnotationFilter(filter as any)}
                            className={`text-xs ${annotationFilter === filter ? 'bg-blue-600 text-white' : ''}`}
                          >
                            {filter}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Annotations List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredAnnotations.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-gray-500 text-sm">No annotations yet</p>
                          <p className="text-gray-400 text-xs mt-1">
                            Use the annotation tools to add highlights and comments
                          </p>
                        </div>
                      ) : (
                        filteredAnnotations.map(annotation => (
                          <div
                            key={annotation.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedAnnotation?.id === annotation.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              setSelectedAnnotation(annotation)
                              setCurrentPage(annotation.page)
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {annotation.type === 'highlight' && (
                                    <Highlighter className="w-4 h-4 text-yellow-600" />
                                  )}
                                  {annotation.type === 'comment' && (
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                  )}
                                  {annotation.type === 'bookmark' && (
                                    <Bookmark className="w-4 h-4 text-red-600" />
                                  )}
                                  <span className="text-xs text-gray-500">
                                    Page {annotation.page}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-900 mb-1">{annotation.content}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(annotation.timestamp)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteAnnotation(annotation.id)
                                }}
                                className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Show Annotations Panel Button (when hidden) */}
              {!showAnnotationPanel && activePdf && (
                <Button
                  variant="outline"
                  onClick={() => setShowAnnotationPanel(true)}
                  className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Comment Dialog */}
        {showCommentDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Comment</h3>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter your comment..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Comment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCommentDialog(false)
                    setCommentText('')
                    setSelection(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFAnnotator
