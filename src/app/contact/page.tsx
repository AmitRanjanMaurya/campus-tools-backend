'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">Message Sent Successfully!</h1>
            <p className="text-xl text-secondary-600 mb-8">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
            <div className="space-x-4">
              <Link href="/" className="btn-primary">
                Back to Home
              </Link>
              <button
                onClick={() => {
                  setIsSubmitted(false)
                  setFormData({ name: '', email: '', subject: '', message: '', type: 'general' })
                }}
                className="btn-secondary"
              >
                Send Another Message
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Have questions about our tools? Need help with your studies? We're here to help!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-secondary-900">Email</p>
                    <p className="text-secondary-600">contact@campustoolshub.com</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MessageCircle className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-secondary-900">Live Chat</p>
                    <p className="text-secondary-600">Available 9 AM - 6 PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-secondary-900">Response Time</p>
                    <p className="text-secondary-600">Usually within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Frequently Asked</h3>
              <div className="space-y-3">
                <Link href="/faq" className="block p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                  <p className="font-medium text-secondary-900">How do I use the GPA Calculator?</p>
                </Link>
                <Link href="/faq" className="block p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                  <p className="font-medium text-secondary-900">Is my data saved securely?</p>
                </Link>
                <Link href="/faq" className="block p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                  <p className="font-medium text-secondary-900">Can I export my study materials?</p>
                </Link>
                <Link href="/faq" className="text-primary-600 hover:text-primary-700 font-medium">
                  View All FAQs →
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-secondary-700 mb-2">
                    Message Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <div className="bg-secondary-50 p-4 rounded-lg">
                  <p className="text-sm text-secondary-600">
                    By submitting this form, you agree to our{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                      Terms of Service
                    </Link>
                    .
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Mail className="h-8 w-8 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold text-secondary-900 mb-2">Email Support</h3>
            <p className="text-sm text-secondary-600">Get detailed help via email with screenshots and examples</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <MessageCircle className="h-8 w-8 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold text-secondary-900 mb-2">Live Chat</h3>
            <p className="text-sm text-secondary-600">Quick answers to simple questions during business hours</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <Clock className="h-8 w-8 text-primary-600 mx-auto mb-3" />
            <h3 className="font-semibold text-secondary-900 mb-2">Fast Response</h3>
            <p className="text-sm text-secondary-600">Most inquiries answered within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  )
}
