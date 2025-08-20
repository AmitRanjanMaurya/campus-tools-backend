import Link from 'next/link'
import { ArrowLeft, FileText, Scale, CheckCircle, AlertTriangle, User, Globe } from 'lucide-react'

export default function TermsPage() {
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
            <Scale className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-secondary-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Welcome to StudentTools</h2>
            <p className="text-secondary-600 leading-relaxed">
              These Terms of Service ("Terms") govern your use of the StudentTools platform. 
              By accessing or using our services, you agree to be bound by these Terms.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-secondary-900">Acceptance of Terms</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              By using StudentTools, you confirm that you accept these Terms and that you agree to comply with them. 
              If you do not agree to these Terms, you must not use our services.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-secondary-900">User Responsibilities</h2>
            </div>
            <div className="space-y-3 text-secondary-600">
              <p><strong>You agree to:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use our services only for lawful and educational purposes</li>
                <li>Provide accurate information when using our tools</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Not attempt to disrupt or compromise our services</li>
                <li>Not use our platform to distribute malicious content</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-secondary-900">Service Availability</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              We strive to maintain high availability of our services, but we cannot guarantee uninterrupted access. 
              We may temporarily suspend services for maintenance, updates, or due to circumstances beyond our control.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
              <h2 className="text-xl font-bold text-secondary-900">Disclaimer</h2>
            </div>
            <div className="space-y-3 text-secondary-600">
              <p>
                Our tools are provided for educational and informational purposes. While we strive for accuracy, 
                we cannot guarantee that our calculations or outputs are error-free.
              </p>
              <p>
                <strong>Important:</strong> Always verify important calculations (like GPA) with your institution's 
                official records and consult with academic advisors for important decisions.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Globe className="h-6 w-6 text-teal-600 mr-3" />
              <h2 className="text-xl font-bold text-secondary-900">Intellectual Property</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              The StudentTools platform, including its design, functionality, and content, is owned by us and 
              protected by intellectual property laws. You may use our services for personal, educational purposes only.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Changes to Terms</h2>
            <p className="text-secondary-600 leading-relaxed">
              We may update these Terms from time to time. We will notify users of any significant changes. 
              Your continued use of our services after changes take effect constitutes acceptance of the new Terms.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Contact Information</h2>
            <p className="text-secondary-600 leading-relaxed">
              If you have questions about these Terms of Service, please contact us through our support channels. 
              We're here to help clarify any concerns you may have.
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
