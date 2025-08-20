import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Users, Database, Mail } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-secondary-600 hover:text-primary-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-secondary-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Our Commitment to Privacy</h2>
            <p className="text-secondary-600 leading-relaxed">
              At StudentTools, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-bold text-secondary-900">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-secondary-600">
              <div>
                <h3 className="font-semibold text-secondary-900 mb-2">Information You Provide:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Course information for GPA calculations</li>
                  <li>Study session data from timers</li>
                  <li>Notes and flashcard content</li>
                  <li>Resume information (when using resume builder)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 mb-2">Automatically Collected:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Usage statistics to improve our services</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-bold text-secondary-900">How We Use Your Information</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 text-secondary-600 ml-4">
              <li>To provide and improve our tools and services</li>
              <li>To save your progress and preferences</li>
              <li>To analyze usage patterns and optimize performance</li>
              <li>To communicate important updates about our services</li>
            </ul>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-bold text-secondary-900">Data Security</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              We implement industry-standard security measures to protect your data. All sensitive information is encrypted 
              during transmission and storage. We regularly update our security practices to ensure your information remains safe.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-bold text-secondary-900">Data Sharing</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties. Your data is used 
              solely to provide you with our services and improve your experience on our platform.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-bold text-secondary-900">Contact Us</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us through our 
              support channels. We're committed to addressing your concerns promptly and transparently.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
