import { CheckCircle, Zap, Shield, Users } from 'lucide-react'

const features = [
  {
    title: 'All-in-One Platform',
    description: 'Access all your essential student tools from a single, unified platform. No more juggling between different apps.',
    icon: Zap,
  },
  {
    title: 'Free to Use',
    description: 'All basic features are completely free. Premium features available for advanced users who need more.',
    icon: CheckCircle,
  },
  {
    title: 'Privacy Focused',
    description: 'Your data stays secure with us. We use industry-standard encryption and never sell your personal information.',
    icon: Shield,
  },
  {
    title: 'Student Community',
    description: 'Join thousands of students who are already using our tools to improve their academic performance.',
    icon: Users,
  },
]

const Features = () => {
  return (
    <section className="py-20 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Why Choose StudentTools?
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            We're dedicated to making your academic journey smoother and more productive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features
