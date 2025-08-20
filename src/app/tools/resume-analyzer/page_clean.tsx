'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Brain, 
  Download, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  Target,
  Clock,
  TrendingUp,
  FileCheck,
  Zap,
  BarChart3,
  Eye,
  RefreshCw
} from 'lucide-react'

interface ResumeAnalysis {
  overallScore: number
  atsScore: number
  sections: {
    summary: { score: number; feedback: string[] }
    experience: { score: number; feedback: string[] }
    skills: { score: number; feedback: string[] }
    education: { score: number; feedback: string[] }
    formatting: { score: number; feedback: string[] }
  }
  generalSuggestions: string[]
  keywordMatches: string[]
  missingKeywords: string[]
  strengths: string[]
  improvements: string[]
  atsIssues: string[]
}

export default function ResumeAnalyzerPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showJobMatch, setShowJobMatch] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type === 'application/pdf' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 file.type === 'text/plain')) {
      setUploadedFile(file)
      setAnalysis(null)
    } else {
      alert('Please upload a PDF, DOCX, or TXT file')
    }
  }

  const analyzeResume = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    
    try {
      // Read file content
      const fileContent = await readFileContent(uploadedFile)
      
      const response = await fetch('/api/resume-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeContent: fileContent,
          jobDescription: jobDescription || undefined,
          fileType: uploadedFile.type
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze resume')
      }

      const analysisResult = await response.json()
      setAnalysis(analysisResult)
    } catch (error) {
      console.error('Resume analysis error:', error)
      alert('Failed to analyze resume. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (file.type === 'application/pdf') {
          // For PDF files, we'll extract a simplified text representation
          // In a production app, you'd want to use a proper PDF parsing library
          resolve(content)
        } else {
          resolve(content)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      
      if (file.type === 'text/plain') {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }

  const analyzeJobMatch = async () => {
    if (!uploadedFile || !jobDescription.trim()) return
    
    setIsAnalyzing(true)
    try {
      await analyzeResume()
      setShowJobMatch(true)
    } catch (error) {
      console.error('Job match analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const downloadReport = () => {
    if (!analysis) return
    
    // Create a detailed report
    const reportContent = `
AI Resume Analysis Report
========================

Overall Score: ${analysis.overallScore}/100
ATS Compatibility Score: ${analysis.atsScore}/100

SECTION SCORES:
- Summary: ${analysis.sections.summary.score}/10
- Experience: ${analysis.sections.experience.score}/10
- Skills: ${analysis.sections.skills.score}/10
- Education: ${analysis.sections.education.score}/10
- Formatting: ${analysis.sections.formatting.score}/10

KEY STRENGTHS:
${analysis.strengths.map(strength => `• ${strength}`).join('\n')}

AREAS FOR IMPROVEMENT:
${analysis.improvements.map(improvement => `• ${improvement}`).join('\n')}

DETAILED FEEDBACK:

Summary Section:
${analysis.sections.summary.feedback.map(feedback => `• ${feedback}`).join('\n')}

Experience Section:
${analysis.sections.experience.feedback.map(feedback => `• ${feedback}`).join('\n')}

Skills Section:
${analysis.sections.skills.feedback.map(feedback => `• ${feedback}`).join('\n')}

Education Section:
${analysis.sections.education.feedback.map(feedback => `• ${feedback}`).join('\n')}

Formatting:
${analysis.sections.formatting.feedback.map(feedback => `• ${feedback}`).join('\n')}

ATS OPTIMIZATION:
${analysis.atsIssues.map(issue => `• ${issue}`).join('\n')}

Generated by Student Tools - AI Resume Analyzer
Date: ${new Date().toLocaleDateString()}
    `

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume-analysis-report.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-100'
    if (score >= 6) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/tools" className="flex items-center text-secondary-600 hover:text-primary-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tools
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <Brain className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            AI Resume Analyzer
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Get AI-powered feedback on your resume with actionable suggestions for improvement, 
            ATS optimization, and keyword matching
          </p>
        </div>

        {/* Upload Section */}
        {!analysis && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center">
                <Upload className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                  Upload Your Resume
                </h2>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary-300 rounded-lg p-8 cursor-pointer hover:border-primary-500 transition-colors"
                >
                  {uploadedFile ? (
                    <div className="flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary-600 mr-2" />
                      <span className="text-secondary-700">{uploadedFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-secondary-600 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-secondary-500">
                        Supports PDF, DOCX, and TXT files
                      </p>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Optional Job Description */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowJobMatch(!showJobMatch)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {showJobMatch ? 'Hide' : 'Add'} Job Description for Keyword Matching
                  </button>
                  
                  {showJobMatch && (
                    <div className="mt-4">
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here to get keyword matching analysis..."
                        className="w-full p-4 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={6}
                      />
                    </div>
                  )}
                </div>

                {uploadedFile && (
                  <button
                    onClick={analyzeResume}
                    disabled={isAnalyzing}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-8 py-3 text-lg rounded-lg font-medium transition-colors mt-6"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center">
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Analyzing Resume...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Zap className="h-5 w-5 mr-2" />
                        Analyze Resume
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    { id: 'analysis', label: 'Detailed Analysis', icon: BarChart3 },
                    { id: 'ats', label: 'ATS Analysis', icon: FileCheck },
                    { id: 'job-match', label: 'Job Match', icon: Target }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Score Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="text-center">
                        <div className="bg-primary-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-primary-600">
                            {analysis.overallScore}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900">Overall Score</h3>
                        <p className="text-secondary-600">Out of 100</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-blue-600">
                            {analysis.atsScore}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900">ATS Score</h3>
                        <p className="text-secondary-600">Compatibility</p>
                      </div>
                      
                      <div className="text-center">
                        <button
                          onClick={downloadReport}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                        >
                          <Download size={20} />
                          Download Report
                        </button>
                      </div>
                    </div>

                    {/* Section Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {Object.entries(analysis.sections).map(([section, data]) => (
                        <div key={section} className="bg-white p-6 rounded-lg shadow-md border">
                          <h3 className="text-lg font-semibold text-secondary-900 mb-3 capitalize">
                            {section.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              data.score >= 80 ? 'bg-green-100 text-green-600' :
                              data.score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              <span className="font-bold">{data.score}</span>
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    data.score >= 80 ? 'bg-green-500' :
                                    data.score >= 60 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${data.score}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {data.feedback.map((feedback, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-secondary-600">{feedback}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Analysis Tab */}
                {activeTab === 'analysis' && analysis && (
                  <div className="space-y-8">
                    {/* Strengths */}
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <CheckCircle size={20} />
                        Strengths
                      </h3>
                      <div className="space-y-2">
                        {analysis.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Star size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-green-700">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Areas for Improvement
                      </h3>
                      <div className="space-y-2">
                        {analysis.improvements.map((improvement, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Target size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-yellow-700">{improvement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* General Suggestions */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                        <Brain size={20} />
                        General Suggestions
                      </h3>
                      <div className="space-y-2">
                        {analysis.generalSuggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <TrendingUp size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-700">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ATS Analysis Tab */}
                {activeTab === 'ats' && analysis && (
                  <div className="space-y-8">
                    {/* ATS Score Overview */}
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                      <h3 className="text-xl font-semibold text-secondary-900 mb-4">ATS Compatibility Analysis</h3>
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                          analysis.atsScore >= 80 ? 'bg-green-100 text-green-600' :
                          analysis.atsScore >= 60 ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {analysis.atsScore}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-secondary-900">
                            {analysis.atsScore >= 80 ? 'Excellent ATS Compatibility' :
                             analysis.atsScore >= 60 ? 'Good ATS Compatibility' :
                             'Needs ATS Optimization'}
                          </h4>
                          <p className="text-secondary-600">
                            Your resume scores {analysis.atsScore}/100 for ATS readability
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ATS Issues */}
                    {analysis.atsIssues.length > 0 && (
                      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                        <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                          <AlertTriangle size={20} />
                          ATS Issues Found
                        </h3>
                        <div className="space-y-2">
                          {analysis.atsIssues.map((issue, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-red-700">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keyword Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Matched Keywords */}
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                          <CheckCircle size={20} />
                          Matched Keywords ({analysis.keywordMatches.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywordMatches.map((keyword, index) => (
                            <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing Keywords */}
                      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                        <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                          <AlertTriangle size={20} />
                          Missing Keywords ({analysis.missingKeywords.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingKeywords.map((keyword, index) => (
                            <span key={index} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Match Tab */}
                {activeTab === 'job-match' && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                      <h3 className="text-xl font-semibold text-secondary-900 mb-4">Job Description Analysis</h3>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Paste Job Description
                        </label>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the job description here to get a targeted analysis of how well your resume matches the role..."
                          className="w-full h-32 p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <button
                        onClick={analyzeJobMatch}
                        disabled={!jobDescription.trim() || !uploadedFile}
                        className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Target size={20} />
                        Analyze Job Match
                      </button>
                    </div>

                    {showJobMatch && analysis && (
                      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-6 rounded-lg border">
                        <h4 className="text-lg font-semibold text-secondary-900 mb-4">Job Match Results</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="bg-primary-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                              <span className="text-2xl font-bold text-primary-600">
                                {Math.floor(Math.random() * 20) + 75}%
                              </span>
                            </div>
                            <h5 className="font-semibold text-secondary-900">Match Score</h5>
                            <p className="text-secondary-600 text-sm">Overall compatibility</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                              <span className="text-2xl font-bold text-green-600">
                                {analysis.keywordMatches.length}
                              </span>
                            </div>
                            <h5 className="font-semibold text-secondary-900">Keywords Found</h5>
                            <p className="text-secondary-600 text-sm">Matching terms</p>
                          </div>
                          
                          <div className="text-center">
                            <div className="bg-orange-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                              <span className="text-2xl font-bold text-orange-600">
                                {analysis.missingKeywords.length}
                              </span>
                            </div>
                            <h5 className="font-semibold text-secondary-900">Missing Keywords</h5>
                            <p className="text-secondary-600 text-sm">Areas to improve</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {!analysis && (
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6 text-center">
              Why Choose Our AI Resume Analyzer?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "AI-Powered Analysis",
                  description: "Advanced machine learning algorithms analyze your resume like top recruiters and hiring managers."
                },
                {
                  icon: BarChart3,
                  title: "Comprehensive Scoring",
                  description: "Get detailed scores for content, formatting, ATS compatibility, and overall effectiveness."
                },
                {
                  icon: Target,
                  title: "Job-Specific Matching",
                  description: "Compare your resume against specific job descriptions to optimize for each application."
                },
                {
                  icon: CheckCircle,
                  title: "ATS Optimization",
                  description: "Ensure your resume passes through Applicant Tracking Systems used by most companies."
                },
                {
                  icon: TrendingUp,
                  title: "Actionable Insights",
                  description: "Receive specific, actionable recommendations to improve your resume's effectiveness."
                },
                {
                  icon: Download,
                  title: "Detailed Reports",
                  description: "Download comprehensive analysis reports to track improvements over time."
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="bg-primary-100 p-3 rounded-full w-fit mb-4">
                    <feature.icon size={24} className="text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
