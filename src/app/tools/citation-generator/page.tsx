'use client'

import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  FileText, 
  Globe, 
  Video, 
  GraduationCap,
  Copy,
  Download,
  History,
  Plus,
  Trash2,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Newspaper,
  Users
} from 'lucide-react'
import Link from 'next/link'

interface Citation {
  id: string
  type: string
  style: string
  input: Record<string, any>
  output: string
  createdAt: Date
}

const CITATION_STYLES = {
  apa: {
    name: 'APA (7th Edition)',
    description: 'American Psychological Association',
    color: 'blue'
  },
  mla: {
    name: 'MLA (9th Edition)', 
    description: 'Modern Language Association',
    color: 'green'
  },
  chicago: {
    name: 'Chicago (17th Edition)',
    description: 'Chicago Manual of Style',
    color: 'purple'
  }
}

const SOURCE_TYPES = {
  book: {
    name: 'Book',
    icon: BookOpen,
    color: 'blue',
    fields: [
      { name: 'author', label: 'Author(s)', type: 'text', required: true, placeholder: 'Last, First M.' },
      { name: 'title', label: 'Book Title', type: 'text', required: true },
      { name: 'publisher', label: 'Publisher', type: 'text', required: true },
      { name: 'year', label: 'Publication Year', type: 'number', required: true },
      { name: 'edition', label: 'Edition', type: 'text', required: false },
      { name: 'city', label: 'Publication City', type: 'text', required: false }
    ]
  },
  journal: {
    name: 'Journal Article',
    icon: FileText,
    color: 'green',
    fields: [
      { name: 'author', label: 'Author(s)', type: 'text', required: true },
      { name: 'title', label: 'Article Title', type: 'text', required: true },
      { name: 'journal', label: 'Journal Name', type: 'text', required: true },
      { name: 'volume', label: 'Volume', type: 'number', required: true },
      { name: 'issue', label: 'Issue', type: 'number', required: false },
      { name: 'pages', label: 'Page Range', type: 'text', required: true, placeholder: '123-145' },
      { name: 'year', label: 'Publication Year', type: 'number', required: true },
      { name: 'doi', label: 'DOI', type: 'text', required: false, placeholder: '10.1000/xyz123' }
    ]
  },
  website: {
    name: 'Website',
    icon: Globe,
    color: 'orange',
    fields: [
      { name: 'author', label: 'Author', type: 'text', required: false },
      { name: 'title', label: 'Page/Article Title', type: 'text', required: true },
      { name: 'website', label: 'Website Name', type: 'text', required: true },
      { name: 'url', label: 'URL', type: 'url', required: true },
      { name: 'publishDate', label: 'Publication Date', type: 'date', required: false },
      { name: 'accessDate', label: 'Access Date', type: 'date', required: true }
    ]
  },
  video: {
    name: 'YouTube Video',
    icon: Video,
    color: 'red',
    fields: [
      { name: 'creator', label: 'Creator/Channel', type: 'text', required: true },
      { name: 'title', label: 'Video Title', type: 'text', required: true },
      { name: 'platform', label: 'Platform', type: 'text', required: true, placeholder: 'YouTube' },
      { name: 'url', label: 'Video URL', type: 'url', required: true },
      { name: 'uploadDate', label: 'Upload Date', type: 'date', required: true },
      { name: 'duration', label: 'Duration', type: 'text', required: false, placeholder: '10:30' }
    ]
  },
  thesis: {
    name: 'Thesis/Dissertation',
    icon: GraduationCap,
    color: 'purple',
    fields: [
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'title', label: 'Thesis Title', type: 'text', required: true },
      { name: 'institution', label: 'Institution', type: 'text', required: true },
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'type', label: 'Type', type: 'text', required: true, placeholder: 'Master\'s thesis' },
      { name: 'database', label: 'Database', type: 'text', required: false, placeholder: 'ProQuest' }
    ]
  },
  newspaper: {
    name: 'Newspaper Article',
    icon: Newspaper,
    color: 'yellow',
    fields: [
      { name: 'author', label: 'Author', type: 'text', required: true },
      { name: 'title', label: 'Article Title', type: 'text', required: true },
      { name: 'newspaper', label: 'Newspaper Name', type: 'text', required: true },
      { name: 'date', label: 'Publication Date', type: 'date', required: true },
      { name: 'pages', label: 'Page(s)', type: 'text', required: false },
      { name: 'url', label: 'URL', type: 'url', required: false }
    ]
  },
  conference: {
    name: 'Conference Paper',
    icon: Users,
    color: 'indigo',
    fields: [
      { name: 'author', label: 'Author(s)', type: 'text', required: true },
      { name: 'title', label: 'Paper Title', type: 'text', required: true },
      { name: 'conference', label: 'Conference Name', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'pages', label: 'Page Range', type: 'text', required: false },
      { name: 'doi', label: 'DOI', type: 'text', required: false }
    ]
  }
}

export default function CitationGenerator() {
  const [selectedStyle, setSelectedStyle] = useState<string>('apa')
  const [selectedType, setSelectedType] = useState<string>('book')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [generatedCitation, setGeneratedCitation] = useState<string>('')
  const [citations, setCitations] = useState<Citation[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Load citations from localStorage
  useEffect(() => {
    const savedCitations = localStorage.getItem('citation_history')
    if (savedCitations) {
      try {
        const parsed = JSON.parse(savedCitations)
        if (Array.isArray(parsed)) {
          setCitations(parsed.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          })))
        }
      } catch (error) {
        console.error('Error loading citations:', error)
      }
    }
  }, [])

  // Save citations to localStorage
  const saveCitations = (newCitations: Citation[]) => {
    localStorage.setItem('citation_history', JSON.stringify(newCitations))
    setCitations(newCitations)
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Reset form when type changes
  useEffect(() => {
    setFormData({})
    setGeneratedCitation('')
  }, [selectedType])

  // Generate citation based on style and type
  const generateCitation = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      let citation = ''
      
      try {
        switch (selectedStyle) {
          case 'apa':
            citation = generateAPACitation()
            break
          case 'mla':
            citation = generateMLACitation()
            break
          case 'chicago':
            citation = generateChicagoCitation()
            break
          default:
            citation = 'Citation style not supported'
        }

        setGeneratedCitation(citation)

        // Save to history
        const newCitation: Citation = {
          id: Date.now().toString(),
          type: selectedType,
          style: selectedStyle,
          input: { ...formData },
          output: citation,
          createdAt: new Date()
        }

        const updatedCitations = [newCitation, ...citations.slice(0, 49)] // Keep last 50
        saveCitations(updatedCitations)
        
      } catch (error) {
        console.error('Error generating citation:', error)
        setGeneratedCitation('Error generating citation. Please check your inputs.')
      }
      
      setIsGenerating(false)
    }, 500)
  }

  // APA Citation Generator
  const generateAPACitation = (): string => {
    const { author, title, publisher, year, journal, volume, issue, pages, doi, website, url, accessDate, creator, platform, uploadDate, institution, type: thesisType, newspaper, date, conference, location } = formData

    switch (selectedType) {
      case 'book':
        const authorAPA = formatAuthorAPA(author)
        return `${authorAPA} (${year}). *${title}*${formData.edition ? ` (${formData.edition})` : ''}. ${publisher}.`
      
      case 'journal':
        const journalAuthorAPA = formatAuthorAPA(author)
        const doiUrl = doi ? `https://doi.org/${doi}` : ''
        return `${journalAuthorAPA} (${year}). ${title}. *${journal}*, *${volume}*${issue ? `(${issue})` : ''}, ${pages}.${doiUrl ? ` ${doiUrl}` : ''}`
      
      case 'website':
        const webAuthorAPA = author ? formatAuthorAPA(author) : website
        const accessDateFormatted = new Date(accessDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        return `${webAuthorAPA}${formData.publishDate ? ` (${new Date(formData.publishDate).getFullYear()}, ${new Date(formData.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })})` : ' (n.d.)'}. ${title}. *${website}*. Retrieved ${accessDateFormatted}, from ${url}`
      
      case 'video':
        return `${creator}. (${new Date(uploadDate).getFullYear()}, ${new Date(uploadDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}). *${title}* [Video]. ${platform}. ${url}`
      
      case 'thesis':
        return `${formatAuthorAPA(author)} (${year}). *${title}* [${thesisType}, ${institution}]${formData.database ? `. ${formData.database}` : ''}.`
      
      case 'newspaper':
        return `${formatAuthorAPA(author)} (${new Date(date).getFullYear()}, ${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}). ${title}. *${newspaper}*${pages ? `, ${pages}` : ''}.${url ? ` ${url}` : ''}`
      
      case 'conference':
        return `${formatAuthorAPA(author)} (${year}). ${title}. In *${conference}*${pages ? ` (pp. ${pages})` : ''}. ${location}.${doi ? ` https://doi.org/${doi}` : ''}`
      
      default:
        return 'Citation type not supported'
    }
  }

  // MLA Citation Generator
  const generateMLACitation = (): string => {
    const { author, title, publisher, year, journal, volume, issue, pages, website, url, accessDate, creator, platform, uploadDate, institution, newspaper, date, conference, location } = formData

    switch (selectedType) {
      case 'book':
        return `${formatAuthorMLA(author)}. *${title}*. ${publisher}, ${year}.`
      
      case 'journal':
        return `${formatAuthorMLA(author)}. "${title}." *${journal}*, vol. ${volume}${issue ? `, no. ${issue}` : ''}, ${year}, pp. ${pages}.`
      
      case 'website':
        const webAuthorMLA = author ? formatAuthorMLA(author) : ''
        const accessDateFormatted = new Date(accessDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/,/g, '')
        return `${webAuthorMLA}${webAuthorMLA ? '. ' : ''}"${title}." *${website}*${formData.publishDate ? `, ${new Date(formData.publishDate).getFullYear()}` : ''}, ${url}. Accessed ${accessDateFormatted}.`
      
      case 'video':
        return `${creator}. "${title}." *${platform}*, ${new Date(uploadDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/,/g, '')}, ${url}.`
      
      case 'thesis':
        return `${formatAuthorMLA(author)}. *${title}*. ${year}. ${institution}, ${formData.type}.`
      
      case 'newspaper':
        return `${formatAuthorMLA(author)}. "${title}." *${newspaper}*, ${new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/,/g, '')}${pages ? `, ${pages}` : ''}.${url ? ` ${url}.` : ''}`
      
      case 'conference':
        return `${formatAuthorMLA(author)}. "${title}." *${conference}*, ${year}, ${location}${pages ? `, pp. ${pages}` : ''}.`
      
      default:
        return 'Citation type not supported'
    }
  }

  // Chicago Citation Generator
  const generateChicagoCitation = (): string => {
    const { author, title, publisher, year, journal, volume, issue, pages, website, url, accessDate, creator, platform, uploadDate, institution, newspaper, date, conference, location } = formData

    switch (selectedType) {
      case 'book':
        return `${formatAuthorChicago(author)}. *${title}*. ${formData.city ? `${formData.city}: ` : ''}${publisher}, ${year}.`
      
      case 'journal':
        return `${formatAuthorChicago(author)}. "${title}." *${journal}* ${volume}${issue ? `, no. ${issue}` : ''} (${year}): ${pages}.`
      
      case 'website':
        const webAuthorChicago = author ? formatAuthorChicago(author) : website
        const accessDateFormatted = new Date(accessDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        return `${webAuthorChicago}. "${title}." ${website}${formData.publishDate ? `, ${new Date(formData.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}. ${url} (accessed ${accessDateFormatted}).`
      
      case 'video':
        return `${creator}. "${title}." ${platform} video, ${formData.duration ? `${formData.duration}. ` : ''}${new Date(uploadDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. ${url}.`
      
      case 'thesis':
        return `${formatAuthorChicago(author)}. "${title}." ${formData.type}, ${institution}, ${year}.`
      
      case 'newspaper':
        return `${formatAuthorChicago(author)}. "${title}." *${newspaper}*, ${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}${pages ? `, ${pages}` : ''}.${url ? ` ${url}.` : ''}`
      
      case 'conference':
        return `${formatAuthorChicago(author)}. "${title}." Paper presented at ${conference}, ${location}, ${year}.`
      
      default:
        return 'Citation type not supported'
    }
  }

  // Author formatting helpers
  const formatAuthorAPA = (author: string): string => {
    if (!author) return ''
    const parts = author.split(',')
    if (parts.length >= 2) {
      const lastName = parts[0].trim()
      const firstName = parts[1].trim()
      if (firstName) {
        const initials = firstName.split(' ').filter(name => name.trim()).map(name => name.charAt(0).toUpperCase() + '.').join(' ')
        return `${lastName}, ${initials}`
      }
      return lastName
    }
    return author
  }

  const formatAuthorMLA = (author: string): string => {
    if (!author) return ''
    return author
  }

  const formatAuthorChicago = (author: string): string => {
    if (!author) return ''
    return author
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Export citations
  const exportCitations = (format: 'txt' | 'bib') => {
    let content = ''
    const selectedCitations = citations.filter(c => c.style === selectedStyle)

    if (format === 'txt') {
      content = selectedCitations.map(c => c.output).join('\n\n')
    } else if (format === 'bib') {
      content = selectedCitations.map((c, i) => {
        return `@article{ref${i + 1},\n  title={${c.input.title || 'Unknown'}},\n  author={${c.input.author || 'Unknown'}},\n  year={${c.input.year || 'Unknown'}}\n}`
      }).join('\n\n')
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `citations.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Delete citation from history
  const deleteCitation = (id: string) => {
    const updatedCitations = citations.filter(c => c.id !== id)
    saveCitations(updatedCitations)
  }

  // Current source type configuration
  const currentSourceType = SOURCE_TYPES[selectedType as keyof typeof SOURCE_TYPES]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/tools" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Tools
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Citation Generator</h1>
              <p className="text-gray-600 mt-1">Generate accurate citations in APA, MLA, and Chicago formats</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showHistory 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <History className="h-4 w-4 mr-2 inline" />
              History ({citations.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Citation Style Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Citation Style</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(CITATION_STYLES).map(([key, style]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStyle(key)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedStyle === key 
                        ? key === 'apa' ? 'border-blue-500 bg-blue-50' : 
                          key === 'mla' ? 'border-green-500 bg-green-50' : 
                          'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`font-semibold ${
                      key === 'apa' ? 'text-blue-700' : 
                      key === 'mla' ? 'text-green-700' : 
                      'text-purple-700'
                    }`}>{style.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Source Type Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(SOURCE_TYPES).map(([key, type]) => {
                  const Icon = type.icon
                  const getColorClasses = () => {
                    if (selectedType === key) {
                      switch (type.color) {
                        case 'blue': return 'border-blue-500 bg-blue-50'
                        case 'green': return 'border-green-500 bg-green-50'
                        case 'orange': return 'border-orange-500 bg-orange-50'
                        case 'red': return 'border-red-500 bg-red-50'
                        case 'purple': return 'border-purple-500 bg-purple-50'
                        case 'yellow': return 'border-yellow-500 bg-yellow-50'
                        case 'indigo': return 'border-indigo-500 bg-indigo-50'
                        default: return 'border-gray-500 bg-gray-50'
                      }
                    }
                    return 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                  
                  const getIconColor = () => {
                    switch (type.color) {
                      case 'blue': return 'text-blue-600'
                      case 'green': return 'text-green-600'
                      case 'orange': return 'text-orange-600'
                      case 'red': return 'text-red-600'
                      case 'purple': return 'text-purple-600'
                      case 'yellow': return 'text-yellow-600'
                      case 'indigo': return 'text-indigo-600'
                      default: return 'text-gray-600'
                    }
                  }
                  
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedType(key)}
                      className={`p-4 rounded-lg border-2 transition-all ${getColorClasses()}`}
                    >
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${getIconColor()}`} />
                      <div className="text-sm font-medium text-gray-900">{type.name}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Dynamic Input Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Enter {currentSourceType.name} Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSourceType.fields.map((field: any) => (
                  <div key={field.name} className={field.name === 'title' || field.name === 'url' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                      required={field.required}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={generateCitation}
                  disabled={isGenerating || !Object.values(formData).some(v => v)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-lg transition-colors duration-200 shadow-sm text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin inline" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2 inline" />
                      Generate Citation
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Citation Output */}
            {generatedCitation && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Generated Citation</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(generatedCitation)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {copySuccess ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1 inline" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1 inline" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900 leading-relaxed">{generatedCitation}</p>
                </div>
                
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                  <span>{CITATION_STYLES[selectedStyle as keyof typeof CITATION_STYLES].name} • {currentSourceType.name}</span>
                  <span>Generated {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => exportCitations('txt')}
                  disabled={citations.length === 0}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4 mr-2 inline" />
                  Export as Text
                </button>
                <button
                  onClick={() => exportCitations('bib')}
                  disabled={citations.length === 0}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4 mr-2 inline" />
                  Export as BibTeX
                </button>
              </div>
            </div>

            {/* Citation History */}
            {showHistory && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Citations</h3>
                  {citations.length > 0 && (
                    <button
                      onClick={() => saveCitations([])}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {citations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No citations generated yet</p>
                  ) : (
                    citations.slice(0, 10).map(citation => (
                      <div key={citation.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              citation.style === 'apa' ? 'bg-blue-100 text-blue-700' :
                              citation.style === 'mla' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {citation.style.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {SOURCE_TYPES[citation.type as keyof typeof SOURCE_TYPES].name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => copyToClipboard(citation.output)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteCitation(citation.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-900 leading-relaxed line-clamp-3">
                          {citation.output}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {citation.createdAt.toLocaleDateString()} at {citation.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Citation Style Guide */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Style Guide</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">APA (American Psychological Association)</h4>
                  <p className="text-gray-600">Commonly used in psychology, education, and social sciences. Emphasizes author-date format.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">MLA (Modern Language Association)</h4>
                  <p className="text-gray-600">Popular in literature, arts, and humanities. Uses author-page number format.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Chicago Manual of Style</h4>
                  <p className="text-gray-600">Widely used in history, literature, and arts. Offers both notes-bibliography and author-date systems.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
