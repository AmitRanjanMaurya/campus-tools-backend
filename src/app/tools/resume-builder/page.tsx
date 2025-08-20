'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Download, 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  FileText, 
  User, 
  GraduationCap, 
  Briefcase, 
  Brain, 
  FolderPlus,
  Settings,
  Wand2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface PersonalInfo {
  name: string
  email: string
  phone: string
  linkedin: string
  location: string
  summary: string
}

interface Education {
  id: string
  degree: string
  college: string
  year: string
  grade: string
  relevantCourses: string
}

interface Experience {
  id: string
  title: string
  company: string
  duration: string
  points: string[]
}

interface Project {
  id: string
  title: string
  description: string
  technologies: string
  points: string[]
}

interface ResumeData {
  personal: PersonalInfo
  education: Education[]
  experience: Experience[]
  skills: string[]
  projects: Project[]
}

const templates = [
  { id: 'classic', name: 'Classic', description: 'Clean and professional' },
  { id: 'modern', name: 'Modern', description: 'Contemporary design' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
  { id: 'creative', name: 'Creative', description: 'Stand out design' }
]

const skillSuggestions = [
  'JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS', 'Git', 'SQL', 'Java',
  'Project Management', 'Communication', 'Leadership', 'Problem Solving',
  'Figma', 'Adobe Photoshop', 'Microsoft Office', 'Google Analytics'
]

const actionVerbs = [
  'Developed', 'Implemented', 'Created', 'Designed', 'Led', 'Managed', 'Optimized',
  'Achieved', 'Improved', 'Collaborated', 'Analyzed', 'Built', 'Launched', 'Streamlined'
]

export default function ResumeBuilderPage() {
  const [activeSection, setActiveSection] = useState('personal')
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const [resumeData, setResumeData] = useState<ResumeData>({
    personal: {
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      location: '',
      summary: ''
    },
    education: [{
      id: '1',
      degree: '',
      college: '',
      year: '',
      grade: '',
      relevantCourses: ''
    }],
    experience: [{
      id: '1',
      title: '',
      company: '',
      duration: '',
      points: ['']
    }],
    skills: [],
    projects: [{
      id: '1',
      title: '',
      description: '',
      technologies: '',
      points: ['']
    }]
  })
  
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiContext, setAiContext] = useState({ section: '', field: '' })

  const updatePersonal = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }))
  }

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      degree: '',
      college: '',
      year: '',
      grade: '',
      relevantCourses: ''
    }
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }))
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      duration: '',
      points: ['']
    }
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }))
  }

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const addExperiencePoint = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, points: [...exp.points, ''] } : exp
      )
    }))
  }

  const updateExperiencePoint = (expId: string, pointIndex: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === expId ? {
          ...exp,
          points: exp.points.map((point, index) => 
            index === pointIndex ? value : point
          )
        } : exp
      )
    }))
  }

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }))
  }

  const addSkill = (skill: string) => {
    if (skill && !resumeData.skills.includes(skill)) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const saveResume = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/resume-builder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save-resume',
          data: resumeData
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('Resume saved successfully!')
      } else {
        alert('Failed to save resume. Please try again.')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save resume. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const exportToPDF = () => {
    // Create a new window with only the resume content
    const resumeElement = document.getElementById('resume-preview')
    if (!resumeElement) return

    // Clone the resume element to avoid modifying the original
    const clonedResume = resumeElement.cloneNode(true) as HTMLElement
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return

    // Get the current template styles
    const getTemplateStyles = () => {
      switch (selectedTemplate) {
        case 'modern':
          return `
            body { font-family: 'Arial', sans-serif; }
            .resume-content { font-family: 'Arial', sans-serif; }
          `
        case 'minimal':
          return `
            body { font-family: 'Helvetica', sans-serif; }
            .resume-content { font-family: 'Helvetica', sans-serif; }
          `
        case 'creative':
          return `
            body { font-family: 'Georgia', serif; }
            .resume-content { font-family: 'Georgia', serif; }
          `
        default:
          return `
            body { font-family: 'Times New Roman', serif; }
            .resume-content { font-family: 'Times New Roman', serif; }
          `
      }
    }

    const resumeName = resumeData.personal.name || 'Professional_Resume'
    const fileName = resumeName.replace(/\s+/g, '_')

    // Write the HTML content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              background: white;
              color: #000;
              line-height: 1.5;
              padding: 0.5in;
              font-size: 14px;
            }
            
            ${getTemplateStyles()}
            
            .resume-content {
              max-width: 8.5in;
              margin: 0 auto;
              background: white;
            }
            
            /* Template-specific colors and styling */
            .bg-blue-50 { background-color: #eff6ff; }
            .bg-gray-50 { background-color: #f9fafb; }
            .text-blue-600 { color: #2563eb; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-900 { color: #111827; }
            .border-blue-200 { border-color: #bfdbfe; }
            .border-gray-200 { border-color: #e5e7eb; }
            .border-gray-300 { border-color: #d1d5db; }
            
            /* Remove any unwanted elements */
            button { display: none !important; }
            .hidden { display: none !important; }
            
            /* Ensure proper spacing */
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-3 > * + * { margin-top: 12px; }
            .space-y-4 > * + * { margin-top: 16px; }
            .space-y-6 > * + * { margin-top: 24px; }
            
            /* Grid layouts */
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            
            /* Flexbox utilities */
            .flex-col { flex-direction: column; }
            .flex-1 { flex: 1 1 0%; }
            
            /* Background and borders */
            .bg-white { background-color: white; }
            .rounded { border-radius: 4px; }
            .rounded-lg { border-radius: 8px; }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            
            /* Print-specific adjustments */
            @media print {
              .bg-blue-50, .bg-gray-50 { 
                background-color: transparent !important; 
                border: 1px solid #e5e7eb;
              }
              .text-blue-600 { color: #000 !important; }
              .shadow-sm { box-shadow: none !important; }
            }
            h1 { font-size: 24px; margin-bottom: 8px; }
            h2 { font-size: 18px; margin-bottom: 6px; margin-top: 16px; }
            h3 { font-size: 16px; margin-bottom: 4px; }
            p { margin-bottom: 4px; }
            ul { margin-left: 20px; margin-bottom: 8px; }
            li { margin-bottom: 2px; }
            
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .font-medium { font-weight: 600; }
            .font-semibold { font-weight: 600; }
            .text-lg { font-size: 18px; }
            .text-sm { font-size: 12px; }
            .text-xs { font-size: 11px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .pb-4 { padding-bottom: 16px; }
            .border-b { border-bottom: 1px solid #ccc; }
            .border-b-2 { border-bottom: 2px solid #ccc; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .space-x-2 > * + * { margin-left: 8px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .leading-relaxed { line-height: 1.6; }
            .list-disc { list-style-type: disc; }
            .list-inside { list-style-position: inside; }
            .gap-2 { gap: 8px; }
            .flex-wrap { flex-wrap: wrap; }
            
            @media print {
              body {
                padding: 0.3in;
                font-size: 12px;
              }
              .resume-content {
                max-width: none;
                margin: 0;
              }
            }
            
            @page {
              margin: 0.5in;
              size: A4;
            }
          </style>
        </head>
        <body>
          <div class="resume-content">
            ${clonedResume.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 500);
            }
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  const generateAISuggestion = async (context: string, currentText: string = '', section: string = 'general') => {
    setShowAIAssistant(true)
    setAiContext({ section, field: context })
    setAiSuggestion('')
    
    try {
      const response = await fetch('/api/resume-builder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'ai-suggestion',
          data: {
            context,
            currentText,
            section
          }
        })
      })

      const result = await response.json()
      if (result.suggestion) {
        setAiSuggestion(result.suggestion)
      }
    } catch (error) {
      console.error('AI suggestion error:', error)
      setAiSuggestion('Failed to get AI suggestions. Please try again.')
    }
  }

  const applySuggestion = () => {
    if (aiContext.section === 'summary') {
      updatePersonal('summary', aiSuggestion)
    }
    setShowAIAssistant(false)
    setAiSuggestion('')
  }

  const ResumePreview = () => {
    const getTemplateClass = () => {
      switch (selectedTemplate) {
        case 'modern': return 'resume-modern'
        case 'minimal': return 'resume-minimal'
        case 'creative': return 'resume-creative'
        default: return 'resume-classic'
      }
    }

    return (
      <div id="resume-preview" className={`bg-white p-8 shadow-lg min-h-[11in] ${getTemplateClass()}`}>
        <style jsx>{`
          .resume-classic { font-family: 'Times New Roman', serif; }
          .resume-modern { font-family: 'Arial', sans-serif; }
          .resume-minimal { font-family: 'Helvetica', sans-serif; }
          .resume-creative { font-family: 'Georgia', serif; }
        `}</style>
        
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {resumeData.personal.name || 'Your Name'}
          </h1>
          <div className="text-sm text-gray-600 space-x-2">
            {resumeData.personal.email && <span>{resumeData.personal.email}</span>}
            {resumeData.personal.phone && <span>• {resumeData.personal.phone}</span>}
            {resumeData.personal.location && <span>• {resumeData.personal.location}</span>}
            {resumeData.personal.linkedin && <span>• {resumeData.personal.linkedin}</span>}
          </div>
        </div>

        {/* Summary */}
        {resumeData.personal.summary && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200">
              Professional Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {resumeData.personal.summary}
            </p>
          </div>
        )}

        {/* Education */}
        {resumeData.education.some(edu => edu.degree) && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200">
              Education
            </h2>
            {resumeData.education.map(edu => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-sm text-gray-700">{edu.college}</p>
                    {edu.relevantCourses && (
                      <p className="text-xs text-gray-600">Relevant Courses: {edu.relevantCourses}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700">{edu.year}</p>
                    {edu.grade && <p className="text-sm text-gray-600">{edu.grade}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {resumeData.experience.some(exp => exp.title) && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200">
              Experience
            </h2>
            {resumeData.experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-medium text-gray-900">{exp.title}</h3>
                    <p className="text-sm text-gray-700">{exp.company}</p>
                  </div>
                  <p className="text-sm text-gray-700">{exp.duration}</p>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {exp.points.filter(point => point.trim()).map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resumeData.projects.some(proj => proj.title) && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200">
              Projects
            </h2>
            {resumeData.projects.map(proj => (
              <div key={proj.id} className="mb-3">
                <h3 className="font-medium text-gray-900">{proj.title}</h3>
                <p className="text-sm text-gray-700 mb-1">{proj.description}</p>
                {proj.technologies && (
                  <p className="text-xs text-gray-600 mb-1">Technologies: {proj.technologies}</p>
                )}
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {proj.points.filter(point => point.trim()).map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resumeData.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span key={index} className="text-sm text-gray-700">
                  {skill}{index < resumeData.skills.length - 1 ? ' •' : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/tools" className="flex items-center text-secondary-600 hover:text-primary-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Tools
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={saveResume}
              disabled={isSaving}
              className="btn-secondary flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={exportToPDF}
              className="btn-primary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <FileText className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Resume Builder
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Create professional resumes with guided forms, live preview, and multiple templates
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Editor */}
          <div className="space-y-6">
            {/* Template Selector */}
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Template Selection
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-secondary-200 hover:border-primary-300'
                    }`}
                  >
                    <h3 className="font-medium text-secondary-900">{template.name}</h3>
                    <p className="text-sm text-secondary-600">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="card">
              <nav className="space-y-2">
                {[
                  { id: 'personal', label: 'Personal Info', icon: User },
                  { id: 'education', label: 'Education', icon: GraduationCap },
                  { id: 'experience', label: 'Experience', icon: Briefcase },
                  { id: 'projects', label: 'Projects', icon: FolderPlus },
                  { id: 'skills', label: 'Skills', icon: Brain }
                ].map(section => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-secondary-50 text-secondary-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {section.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Form Sections */}
            <div className="card max-h-[600px] overflow-y-auto">
              {/* Personal Info */}
              {activeSection === 'personal' && (
                <div>
                  <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                    Personal Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={resumeData.personal.name}
                        onChange={(e) => updatePersonal('name', e.target.value)}
                        className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={resumeData.personal.email}
                          onChange={(e) => updatePersonal('email', e.target.value)}
                          className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="john@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={resumeData.personal.phone}
                          onChange={(e) => updatePersonal('phone', e.target.value)}
                          className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          LinkedIn Profile
                        </label>
                        <input
                          type="url"
                          value={resumeData.personal.linkedin}
                          onChange={(e) => updatePersonal('linkedin', e.target.value)}
                          className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="linkedin.com/in/johndoe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={resumeData.personal.location}
                          onChange={(e) => updatePersonal('location', e.target.value)}
                          className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="New York, NY"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Professional Summary
                      </label>
                      <textarea
                        value={resumeData.personal.summary}
                        onChange={(e) => updatePersonal('summary', e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Brief summary of your skills and experience..."
                      />
                      <button
                        onClick={() => generateAISuggestion('summary', resumeData.personal.summary, 'summary')}
                        className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <Wand2 className="h-4 w-4 mr-1" />
                        AI Suggestions
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <div>
                  <h2 className="text-lg font-semibold text-secondary-900 mb-4">Skills</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Add Skills
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addSkill(skillInput)
                            }
                          }}
                          className="flex-1 p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Type a skill and press Enter"
                        />
                        <button
                          onClick={() => addSkill(skillInput)}
                          className="btn-primary px-4 py-2"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    
                    {/* Skill Suggestions */}
                    <div>
                      <button
                        onClick={() => setShowSkillSuggestions(!showSkillSuggestions)}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        {showSkillSuggestions ? 'Hide' : 'Show'} Suggestions
                        {showSkillSuggestions ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                      </button>
                      
                      {showSkillSuggestions && (
                        <div className="mt-2 p-3 bg-secondary-50 rounded-lg">
                          <p className="text-sm text-secondary-700 mb-2">Popular skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {skillSuggestions.map(skill => (
                              <button
                                key={skill}
                                onClick={() => addSkill(skill)}
                                className="bg-white border border-secondary-300 text-secondary-700 px-3 py-1 rounded text-xs hover:bg-primary-50 hover:border-primary-300"
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Added Skills */}
                    {resumeData.skills.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Your Skills
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map(skill => (
                            <span
                              key={skill}
                              className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center"
                            >
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-2 text-primary-600 hover:text-primary-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Education */}
              {activeSection === 'education' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-secondary-900">Education</h2>
                    <button
                      onClick={addEducation}
                      className="btn-secondary text-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Education
                    </button>
                  </div>
                  <div className="space-y-6">
                    {resumeData.education.map((edu, index) => (
                      <div key={edu.id} className="border border-secondary-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-secondary-900">
                            Education {index + 1}
                          </h3>
                          {resumeData.education.length > 1 && (
                            <button
                              onClick={() => removeEducation(edu.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                              Degree/Program *
                            </label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="B.Tech Computer Science"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                              College/University *
                            </label>
                            <input
                              type="text"
                              value={edu.college}
                              onChange={(e) => updateEducation(edu.id, 'college', e.target.value)}
                              className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="University of Technology"
                            />
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Year
                              </label>
                              <input
                                type="text"
                                value={edu.year}
                                onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                                className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="2021-2025"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                GPA/Grade
                              </label>
                              <input
                                type="text"
                                value={edu.grade}
                                onChange={(e) => updateEducation(edu.id, 'grade', e.target.value)}
                                className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="8.5 CGPA"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                              Relevant Courses
                            </label>
                            <input
                              type="text"
                              value={edu.relevantCourses}
                              onChange={(e) => updateEducation(edu.id, 'relevantCourses', e.target.value)}
                              className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Data Structures, Algorithms, Database Systems"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {activeSection === 'experience' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-secondary-900">Experience</h2>
                    <button
                      onClick={addExperience}
                      className="btn-secondary text-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Experience
                    </button>
                  </div>
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <div key={exp.id} className="border border-secondary-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-secondary-900">
                            Experience {index + 1}
                          </h3>
                          {resumeData.experience.length > 1 && (
                            <button
                              onClick={() => removeExperience(exp.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                              Job Title *
                            </label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                              className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Software Developer Intern"
                            />
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Company *
                              </label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Tech Corp"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Duration
                              </label>
                              <input
                                type="text"
                                value={exp.duration}
                                onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                                className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="June 2024 - Aug 2024"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                              Key Achievements & Responsibilities
                            </label>
                            {exp.points.map((point, pointIndex) => (
                              <div key={pointIndex} className="flex items-center mb-2">
                                <input
                                  type="text"
                                  value={point}
                                  onChange={(e) => updateExperiencePoint(exp.id, pointIndex, e.target.value)}
                                  className="flex-1 p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  placeholder="Led development of new feature that increased user engagement by 25%"
                                />
                                {exp.points.length > 1 && (
                                  <button
                                    onClick={() => {
                                      const newPoints = exp.points.filter((_, i) => i !== pointIndex)
                                      updateExperience(exp.id, 'points', newPoints)
                                    }}
                                    className="ml-2 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => addExperiencePoint(exp.id)}
                              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Achievement
                            </button>
                            <div className="mt-2 text-xs text-secondary-600">
                              <p className="mb-1">💡 Use action verbs like:</p>
                              <div className="flex flex-wrap gap-1">
                                {actionVerbs.map(verb => (
                                  <span 
                                    key={verb}
                                    className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs cursor-pointer hover:bg-primary-100"
                                    onClick={() => {
                                      const lastPoint = exp.points[exp.points.length - 1]
                                      if (!lastPoint.trim()) {
                                        updateExperiencePoint(exp.id, exp.points.length - 1, verb + ' ')
                                      }
                                    }}
                                  >
                                    {verb}
                                  </span>
                                ))}
                              </div>
                              <button
                                onClick={() => {
                                  const currentText = exp.points.join('\n')
                                  generateAISuggestion('experience', currentText, 'experience')
                                }}
                                className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
                              >
                                <Wand2 className="h-4 w-4 mr-1" />
                                AI Improve Points
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {activeSection === 'projects' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-secondary-900">Projects</h2>
                    <button
                      onClick={() => {
                        const newProject: Project = {
                          id: Date.now().toString(),
                          title: '',
                          description: '',
                          technologies: '',
                          points: ['']
                        }
                        setResumeData(prev => ({
                          ...prev,
                          projects: [...prev.projects, newProject]
                        }))
                      }}
                      className="btn-secondary text-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Project
                    </button>
                  </div>
                  <div className="space-y-6">
                    {resumeData.projects.map((project, index) => (
                      <div key={project.id} className="border border-secondary-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-secondary-900">
                            Project {index + 1}
                          </h3>
                          {resumeData.projects.length > 1 && (
                            <button
                              onClick={() => {
                                setResumeData(prev => ({
                                  ...prev,
                                  projects: prev.projects.filter(p => p.id !== project.id)
                                }))
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                              Project Title *
                            </label>
                            <input
                              type="text"
                              value={project.title}
                              onChange={(e) => {
                                setResumeData(prev => ({
                                  ...prev,
                                  projects: prev.projects.map(p => 
                                    p.id === project.id ? { ...p, title: e.target.value } : p
                                  )
                                }))
                              }}
                              className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="E-commerce Website"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={project.description}
                              onChange={(e) => {
                                setResumeData(prev => ({
                                  ...prev,
                                  projects: prev.projects.map(p => 
                                    p.id === project.id ? { ...p, description: e.target.value } : p
                                  )
                                }))
                              }}
                              className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="Brief description of the project..."
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                              Technologies Used
                            </label>
                            <input
                              type="text"
                              value={project.technologies}
                              onChange={(e) => {
                                setResumeData(prev => ({
                                  ...prev,
                                  projects: prev.projects.map(p => 
                                    p.id === project.id ? { ...p, technologies: e.target.value } : p
                                  )
                                }))
                              }}
                              className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="React, Node.js, MongoDB, etc."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                              Key Features & Achievements
                            </label>
                            {project.points.map((point, pointIndex) => (
                              <div key={pointIndex} className="flex items-center mb-2">
                                <input
                                  type="text"
                                  value={point}
                                  onChange={(e) => {
                                    setResumeData(prev => ({
                                      ...prev,
                                      projects: prev.projects.map(p => 
                                        p.id === project.id ? {
                                          ...p,
                                          points: p.points.map((pt, i) => 
                                            i === pointIndex ? e.target.value : pt
                                          )
                                        } : p
                                      )
                                    }))
                                  }}
                                  className="flex-1 p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  placeholder="Implemented user authentication system with JWT"
                                />
                                {project.points.length > 1 && (
                                  <button
                                    onClick={() => {
                                      setResumeData(prev => ({
                                        ...prev,
                                        projects: prev.projects.map(p => 
                                          p.id === project.id ? {
                                            ...p,
                                            points: p.points.filter((_, i) => i !== pointIndex)
                                          } : p
                                        )
                                      }))
                                    }}
                                    className="ml-2 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                setResumeData(prev => ({
                                  ...prev,
                                  projects: prev.projects.map(p => 
                                    p.id === project.id ? { ...p, points: [...p.points, ''] } : p
                                  )
                                }))
                              }}
                              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Feature
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-8">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Live Preview
                </h2>
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/tools/resume-analyzer"
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    Analyze Resume
                  </Link>
                </div>
              </div>
              <div className="border border-secondary-200 rounded-lg overflow-hidden">
                <div className="bg-secondary-50 p-2 text-xs text-secondary-600 border-b border-secondary-200">
                  Template: {templates.find(t => t.id === selectedTemplate)?.name} | A4 Format
                </div>
                <div className="max-h-[800px] overflow-y-auto bg-white">
                  <ResumePreview />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Modal */}
        {showAIAssistant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Wand2 className="h-5 w-5 text-primary-600 mr-2" />
                  <h3 className="text-lg font-semibold">AI Content Assistant</h3>
                </div>
                <button
                  onClick={() => setShowAIAssistant(false)}
                  className="text-secondary-500 hover:text-secondary-700"
                >
                  ×
                </button>
              </div>
              
              {aiSuggestion ? (
                <div>
                  <div className="mb-4">
                    <h4 className="font-medium text-secondary-900 mb-2">AI Suggestion:</h4>
                    <div className="bg-secondary-50 p-4 rounded-lg border">
                      <p className="text-secondary-800 leading-relaxed whitespace-pre-wrap">
                        {aiSuggestion}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowAIAssistant(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applySuggestion}
                      className="btn-primary"
                    >
                      Apply Suggestion
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-secondary-600">Generating AI suggestions...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
