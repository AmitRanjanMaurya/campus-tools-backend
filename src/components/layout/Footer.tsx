import Link from 'next/link'
import { BookOpen, Github, Twitter, Mail } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const toolCategories = [
    {
      title: 'Academic Tools',
      links: [
        { name: 'GPA Calculator', href: '/tools/gpa-calculator' },
        { name: 'Unit Converter', href: '/tools/unit-converter' },
        { name: 'Scientific Calculator', href: '/tools/scientific-calculator' },
      ]
    },
    {
      title: 'Productivity',
      links: [
        { name: 'Study Timer', href: '/tools/study-timer' },
        { name: 'Notes Organizer', href: '/tools/notes' },
        { name: 'Timetable Maker', href: '/tools/timetable' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Resume Builder', href: '/tools/resume-builder' },
        { name: 'Flashcard Creator', href: '/tools/flashcards' },
        { name: 'Blog', href: '/blog' },
      ]
    }
  ]

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary-400" />
              <span className="font-bold text-xl">CampusToolsHub</span>
            </Link>
            <p className="text-secondary-300 mb-4 max-w-md">
              A comprehensive web-based productivity platform designed specifically for students. 
              Access all your essential academic tools in one place.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Tool Categories */}
          {toolCategories.map((category) => (
            <div key={category.title}>
              <h3 className="font-semibold text-lg mb-4">{category.title}</h3>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-secondary-300 hover:text-primary-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-secondary-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary-400">
            © {currentYear} CampusToolsHub. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-secondary-400 hover:text-primary-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-secondary-400 hover:text-primary-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
