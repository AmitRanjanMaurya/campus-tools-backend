'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Plus, Minus, HelpCircle, MessageCircle, Book, Calculator, Timer, FileText } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I use the GPA Calculator?',
      answer: 'Our GPA Calculator supports multiple grading systems. Simply select your grading scale (4.0, 10-point, or percentage), enter your courses and grades, and the calculator will automatically compute your GPA. You can add or remove courses as needed, and the calculation updates in real-time.',
      category: 'tools',
      tags: ['gpa', 'calculator', 'grades']
    },
    {
      id: '2',
      question: 'Is my data saved when I use the tools?',
      answer: 'Yes, when you create an account, your data is automatically saved and synced across all your devices. Without an account, data is stored locally in your browser. We use encryption to protect your information and never share your personal academic data with third parties.',
      category: 'account',
      tags: ['data', 'privacy', 'security']
    },
    {
      id: '3',
      question: 'Can I export my study materials?',
      answer: 'Absolutely! Most of our tools support export functionality. You can export your notes as PDF or Word documents, download your flashcards, export your timetable as an image, and save your resume as a PDF. Look for the export or download button in each tool.',
      category: 'tools',
      tags: ['export', 'download', 'pdf']
    },
    {
      id: '4',
      question: 'How does the Study Timer work?',
      answer: 'Our Study Timer uses the Pomodoro Technique - 25-minute focused study sessions followed by 5-minute breaks. After 4 sessions, you get a longer 15-30 minute break. You can customize session lengths, enable notifications, and track your study statistics over time.',
      category: 'tools',
      tags: ['timer', 'pomodoro', 'study']
    },
    {
      id: '5',
      question: 'Is Student Tools free to use?',
      answer: 'Yes! Student Tools is completely free to use. All our academic tools, calculators, and basic features are available at no cost. We believe education tools should be accessible to all students. Some advanced features may require a free account.',
      category: 'general',
      tags: ['free', 'cost', 'pricing']
    },
    {
      id: '6',
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the top right corner. You can register with your email address or use social login options. Creating an account allows you to save your work, sync across devices, and access additional features. No credit card required!',
      category: 'account',
      tags: ['account', 'signup', 'registration']
    },
    {
      id: '7',
      question: 'Can I use these tools on my phone?',
      answer: 'Yes! Student Tools is fully responsive and works great on smartphones and tablets. All tools are optimized for mobile use. You can also install our web app on your phone for a native app-like experience.',
      category: 'technical',
      tags: ['mobile', 'responsive', 'app']
    },
    {
      id: '8',
      question: 'How accurate is the GPA calculation?',
      answer: 'Our GPA calculations follow standard academic formulas and are highly accurate. We support various grading systems used by different institutions. However, always check with your school for their specific GPA calculation method, as some institutions may have unique policies.',
      category: 'tools',
      tags: ['gpa', 'accuracy', 'calculation']
    },
    {
      id: '9',
      question: 'Can I collaborate with classmates?',
      answer: 'Currently, most tools are designed for individual use. However, you can share your study materials, flashcards, and notes with classmates. We\'re working on collaborative features like shared study sessions and group projects.',
      category: 'features',
      tags: ['collaboration', 'sharing', 'group']
    },
    {
      id: '10',
      question: 'What if I find a bug or have a suggestion?',
      answer: 'We welcome feedback! You can report bugs or submit feature requests through our Contact page. We actively review all suggestions and regularly update our tools based on user feedback. Your input helps us improve the platform for all students.',
      category: 'support',
      tags: ['bug', 'feedback', 'support']
    },
    {
      id: '11',
      question: 'How do I reset my password?',
      answer: 'If you forgot your password, click "Forgot Password" on the login page. Enter your email address, and we\'ll send you a password reset link. Check your spam folder if you don\'t see the email within a few minutes.',
      category: 'account',
      tags: ['password', 'reset', 'login']
    },
    {
      id: '12',
      question: 'Are there keyboard shortcuts available?',
      answer: 'Yes! Many tools support keyboard shortcuts for faster navigation. Press "?" on most tools to see available shortcuts. Common ones include Ctrl+S to save, Ctrl+E to export, and spacebar to start/stop timers.',
      category: 'technical',
      tags: ['shortcuts', 'keyboard', 'navigation']
    }
  ]

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'tools', name: 'Tools & Features', icon: Calculator },
    { id: 'account', name: 'Account & Settings', icon: FileText },
    { id: 'technical', name: 'Technical Support', icon: MessageCircle },
    { id: 'general', name: 'General Info', icon: Book },
    { id: 'features', name: 'Features & Updates', icon: Plus },
    { id: 'support', name: 'Support & Feedback', icon: HelpCircle }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-secondary-600 hover:text-primary-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <HelpCircle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Find answers to common questions about Student Tools and get the most out of our platform
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="h-5 w-5 text-secondary-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map(category => {
                  const Icon = category.icon
                  const count = category.id === 'all' 
                    ? faqs.length 
                    : faqs.filter(faq => faq.category === category.id).length
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-secondary-50 text-secondary-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <span className="flex-1">{category.name}</span>
                      <span className="text-xs bg-secondary-200 text-secondary-600 px-2 py-1 rounded">
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Quick Contact */}
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <h3 className="text-sm font-medium text-secondary-700 mb-3">Still need help?</h3>
                <Link 
                  href="/contact" 
                  className="block p-3 bg-primary-50 text-primary-700 rounded-lg text-sm text-center hover:bg-primary-100 transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="lg:col-span-3">
            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="card">
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary-50 rounded-lg transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-secondary-900 pr-4">
                        {faq.question}
                      </h3>
                      {openItems.includes(faq.id) ? (
                        <Minus className="h-5 w-5 text-secondary-500 flex-shrink-0" />
                      ) : (
                        <Plus className="h-5 w-5 text-secondary-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    {openItems.includes(faq.id) && (
                      <div className="px-4 pb-4">
                        <div className="border-t border-secondary-200 pt-4">
                          <p className="text-secondary-700 mb-4 leading-relaxed">
                            {faq.answer}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {faq.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="bg-secondary-100 text-secondary-600 px-2 py-1 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">No FAQs found</h3>
                <p className="text-secondary-600 mb-6">
                  Try different keywords or browse all categories.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Contact CTA */}
            <div className="card mt-8 bg-gradient-to-r from-primary-50 to-blue-50">
              <div className="text-center">
                <MessageCircle className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  Didn't find what you're looking for?
                </h3>
                <p className="text-secondary-600 mb-4">
                  Our support team is here to help with any questions or issues you may have.
                </p>
                <div className="space-x-4">
                  <Link href="/contact" className="btn-primary">
                    Contact Support
                  </Link>
                  <Link href="/tools" className="btn-secondary">
                    Browse Tools
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
