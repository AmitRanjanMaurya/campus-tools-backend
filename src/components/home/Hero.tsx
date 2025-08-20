'use client'

import Link from 'next/link'
import { ArrowRight, Star, Users, BookOpen } from 'lucide-react'

const Hero = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6">
            All Your <span className="text-primary-600">Student Tools</span>
            <br />in One Place
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
            Boost your academic productivity with our comprehensive collection of tools. 
            From GPA calculations to resume building, we've got everything you need to succeed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/tools" 
              className="btn-primary inline-flex items-center justify-center px-8 py-3 text-lg"
            >
              Explore Tools
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/dashboard" 
              className="btn-secondary inline-flex items-center justify-center px-8 py-3 text-lg"
            >
              Get Started Free
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">12+</div>
              <div className="text-secondary-600">Essential Tools</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">10K+</div>
              <div className="text-secondary-600">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-secondary-900 mb-1">4.9/5</div>
              <div className="text-secondary-600">User Rating</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </section>
  )
}

export default Hero
