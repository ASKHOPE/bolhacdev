import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Heart, Droplets, Home, Users, Lightbulb, ArrowRight, Search, Filter } from 'lucide-react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

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

  const getUniqueCategories = () => {
    return [...new Set(programs.map(program => program.category))]
  }

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || program.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-background transition-colors duration-300">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-theme-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-background transition-colors duration-300">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <BookOpen className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-semibold text-theme-text transition-colors duration-300 mb-2">Error Loading Programs</h3>
          <p className="text-theme-text-secondary transition-colors duration-300 mb-4">{error}</p>
          <button 
            onClick={fetchPrograms}
            className="px-4 py-2 bg-theme-primary text-white rounded-theme hover:bg-opacity-90 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-background transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-theme-primary to-theme-accent text-white transition-colors duration-300 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">Our Programs</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100 animate-fade-in-delay">
              Comprehensive initiatives designed to create lasting change and empower communities worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-theme-surface transition-colors duration-300 border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-1/2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary h-5 w-5" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-theme-background border border-theme-border rounded-theme focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors duration-300"
              />
            </div>
            <div className="w-full md:w-auto flex items-center space-x-2">
              <Filter className="h-5 w-5 text-theme-text-secondary" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-theme-background border border-theme-border rounded-theme focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors duration-300"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>
                    {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20 bg-theme-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-theme-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-theme-text transition-colors duration-300 mb-2">No Programs Found</h3>
              <p className="text-theme-text-secondary transition-colors duration-300">
                {programs.length === 0 
                  ? "We're currently developing new programs. Check back soon for exciting initiatives!"
                  : "No programs match your current search criteria. Try adjusting your filters."}
              </p>
              {searchTerm || categoryFilter !== 'all' ? (
                <button 
                  onClick={() => {
                    setSearchTerm('')
                    setCategoryFilter('all')
                  }}
                  className="mt-4 px-4 py-2 bg-theme-primary text-white rounded-theme hover:bg-opacity-90 transition-colors duration-300"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-theme-text transition-colors duration-300 mb-4">
                  Our Impact Programs
                </h2>
                <p className="text-xl text-theme-text-secondary transition-colors duration-300 max-w-3xl mx-auto">
                  We focus on sustainable solutions that create lasting change in communities worldwide.
                  Explore our {filteredPrograms.length} active program{filteredPrograms.length !== 1 ? 's' : ''}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPrograms.map((program, index) => {
                  const Icon = getIcon(program.category)
                  const color = getColor(program.category)
                  
                  return (
                    <div
                      key={program.id}
                      className="theme-card overflow-hidden group transform hover:scale-105 transition-all duration-300"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={program.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={program.title}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getColorClasses(color)}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                        </div>
                        {program.featured && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                              Featured
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-theme-text transition-colors duration-300 mb-3">
                          {program.title}
                        </h3>
                        <p className="text-theme-text-secondary transition-colors duration-300 mb-6">
                          {program.description}
                        </p>

                        <div className="flex space-x-3">
                          <Link
                            to={`/programs/${program.category}`}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-theme-primary text-white font-medium rounded-theme hover:bg-opacity-90 transition-colors duration-300"
                          >
                            View Projects
                            <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                          </Link>
                          <Link
                            to={`/donate?program=${program.category}`}
                            className="flex items-center justify-center px-4 py-2 border-2 border-theme-primary text-theme-primary font-medium rounded-theme hover:bg-theme-primary hover:text-white transition-colors duration-300"
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
      <section className="py-20 bg-theme-surface transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-text transition-colors duration-300 mb-6">
            Want to Support Our Programs?
          </h2>
          <p className="text-xl text-theme-text-secondary transition-colors duration-300 mb-8 max-w-3xl mx-auto">
            Your contribution can make a real difference in the lives of thousands of people. 
            Join us in creating sustainable change that lasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/donate"
              className="px-8 py-4 bg-theme-primary text-white font-semibold rounded-theme hover:bg-opacity-90 transition-colors duration-300 transform hover:scale-105"
            >
              Donate Now
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-theme-primary text-theme-primary font-semibold rounded-theme hover:bg-theme-primary hover:text-white transition-colors duration-300 transform hover:scale-105"
            >
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}