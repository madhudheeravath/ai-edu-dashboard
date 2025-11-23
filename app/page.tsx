import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap, BarChart3, Brain, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">EduAI Platform</span>
          </div>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Higher Purpose,
            <span className="text-primary"> Greater Good</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Balancing AI Assistance with Human Creativity in Education
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            A research-driven platform that empowers students to leverage AI tools 
            while maintaining independent thinking and creativity.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mt-20 animate-slide-up">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-4xl font-bold text-primary">3,500+</div>
            <div className="text-gray-600 mt-2">Students</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-4xl font-bold text-primary">150+</div>
            <div className="text-gray-600 mt-2">Faculty</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-4xl font-bold text-primary">46%</div>
            <div className="text-gray-600 mt-2">AI Usage Rate</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-4xl font-bold text-primary">4.2</div>
            <div className="text-gray-600 mt-2">Avg Creativity Score</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">Platform Features</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Research-backed tools designed to balance AI assistance with human creativity
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg border">
              <Brain className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
              <p className="text-gray-600">
                Intelligent chatbot that guides learning without giving direct answers
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-lg border">
              <Shield className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Draft Protection</h3>
              <p className="text-gray-600">
                AI locked until students submit original draft work
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-lg border">
              <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">
                Track creativity scores, AI usage, and learning progress
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-lg border">
              <GraduationCap className="h-12 w-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Reflection System</h3>
              <p className="text-gray-600">
                Students document AI contributions for metacognitive growth
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-6 w-6" />
            <span className="text-xl font-bold">EduAI Platform</span>
          </div>
          <p className="text-gray-400">
            Saint Louis University - Master Research Project
          </p>
          <p className="text-gray-400 mt-2">
            AI Dependency vs. Human Creativity in Education
          </p>
        </div>
      </footer>
    </div>
  )
}
