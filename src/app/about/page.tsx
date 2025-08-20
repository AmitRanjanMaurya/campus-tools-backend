import Link from 'next/link'
import { ArrowLeft, BookOpen, Users, Target, Heart } from 'lucide-react'

export default function AboutPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            About StudentTools
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Empowering students worldwide with essential productivity tools
          </p>
        </div>

        {/* Mission Section */}
        <div className="card mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Target className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Our Mission</h2>
          </div>
          <p className="text-secondary-600 leading-relaxed text-center max-w-3xl mx-auto">
            We believe that every student deserves access to powerful, easy-to-use tools that can enhance their academic journey. 
            StudentTools was created to bring together all the essential utilities students need in one convenient platform, 
            eliminating the need to search for and manage multiple apps and websites.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card">
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
              <h3 className="text-xl font-semibold text-secondary-900">Academic Focus</h3>
            </div>
            <p className="text-secondary-600">
              Every tool is designed specifically for students, addressing real academic challenges from GPA tracking to study time management.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-secondary-900">Community Driven</h3>
            </div>
            <p className="text-secondary-600">
              Built based on feedback from thousands of students worldwide, ensuring our tools meet real-world academic needs.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 text-center mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-secondary-600">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-secondary-600">GPA Calculations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">100K+</div>
              <div className="text-secondary-600">Study Sessions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
              <div className="text-secondary-600">Essential Tools</div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-semibold text-secondary-900 mb-2">🎯 Simplicity</h3>
              <p className="text-secondary-600 text-sm">Clean, intuitive interfaces that don't get in your way</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-secondary-900 mb-2">🔒 Privacy</h3>
              <p className="text-secondary-600 text-sm">Your data stays private and secure with industry-standard protection</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-secondary-900 mb-2">💡 Innovation</h3>
              <p className="text-secondary-600 text-sm">Constantly improving and adding new features based on student needs</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Heart className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Built with ❤️</h2>
          <p className="text-secondary-600 leading-relaxed max-w-2xl mx-auto mb-6">
            StudentTools is developed by a dedicated team of educators and developers who understand the challenges of student life. 
            We're committed to creating tools that genuinely help students succeed.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/tools" className="btn-primary">
              Explore Tools
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
