import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Heart, Droplets, Home, Users, Lightbulb, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Program {
  id: string
  title: string
  description: string
  category: string
  image_url: string | null
  published: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export function Programs() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categoryIcons = {
    education: BookOpen,
    healthcare: Heart,
    'clean-water': Droplets,
    housing: Home,
    'community-empowerment': Users,
    innovation: Lightbulb,
  }

  const categoryColors = {
    education: 'blue',
    healthcare: 'red',
    'clean-water': 'cyan',
    housing: 'green',
    'community-empowerment': 'purple',
    innovation: 'yellow',
  }

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      setError(null)
      console.log('Fetching programs from Supabase...')
      
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Programs fetched:', data)
      setPrograms(data || [])
    } catch (error) {
      console.error('Error fetching programs:', error)
      setError('Failed to load programs. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      red: 'bg-red-100 text-red-600',
      cyan: 'bg-cyan-100 text-cyan-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
    }
    return colors[color as keyof typeof colors] || 'bg-blue-100 text-blue-600'
  }

  const getIcon = (category: string) => {
    return categoryIcons[category as keyof typeof categoryIcons] || BookOpen
  }

  const getColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || 'blue'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <BookOpen className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Programs</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPrograms}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Programs</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100">
              Comprehensive initiatives designed to create lasting change and empower communities worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {programs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Programs Available</h3>
              <p className="text-gray-600">
                We're currently developing new programs. Check back soon for exciting initiatives!
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Our Impact Programs
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  We focus on sustainable solutions that create lasting change in communities worldwide.
                  Explore our {programs.length} active program{programs.length !== 1 ? 's' : ''}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.map((program) => {
                  const Icon = getIcon(program.category)
                  const color = getColor(program.category)
                  
                  return (
                    <div
                      key={program.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                    >
                      <div className="relative">
                        <img
                          src={program.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={program.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getColorClasses(color)}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                        </div>
                        {program.featured && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {program.title}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {program.description}
                        </p>

                        <div className="flex space-x-3">
                          <Link
                            to={`/programs/${program.category}`}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Projects
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                          <Link
                            to={`/donate?program=${program.category}`}
                            className="flex items-center justify-center px-4 py-2 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                          >
                            <Heart className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Want to Support Our Programs?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your contribution can make a real difference in the lives of thousands of people. 
            Join us in creating sustainable change that lasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/donate"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Donate Now
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}