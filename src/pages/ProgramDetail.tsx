import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Heart, MapPin, Calendar, Target, Users, DollarSign, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Project {
  id: string
  title: string
  description: string
  location: string
  target_amount: number
  raised_amount: number
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'upcoming'
  image_url: string
  beneficiaries: number
  program_category: string
}

export function ProgramDetail() {
  const { programId } = useParams<{ programId: string }>()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const programInfo = {
    education: {
      title: 'Education Initiative',
      description: 'Providing quality education and learning resources to underserved communities worldwide.',
      color: 'blue'
    },
    healthcare: {
      title: 'Healthcare Access',
      description: 'Ensuring basic healthcare services reach remote and marginalized communities.',
      color: 'red'
    },
    'clean-water': {
      title: 'Clean Water Project',
      description: 'Building sustainable water systems and sanitation facilities for communities in need.',
      color: 'cyan'
    },
    housing: {
      title: 'Housing Development',
      description: 'Providing safe, affordable housing solutions for families in crisis.',
      color: 'green'
    },
    'community-empowerment': {
      title: 'Community Empowerment',
      description: 'Supporting local leadership and economic development initiatives.',
      color: 'purple'
    },
    innovation: {
      title: 'Innovation Lab',
      description: 'Developing technology solutions for humanitarian challenges.',
      color: 'yellow'
    }
  }

  useEffect(() => {
    if (programId) {
      fetchProjects()
    }
  }, [programId])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('program_category', programId)
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const currentProgram = programId ? programInfo[programId as keyof typeof programInfo] : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentProgram || !programId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Not Found</h2>
          <Link to="/programs" className="text-blue-600 hover:text-blue-700">
            ← Back to Programs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/programs"
            className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Link>
          
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {currentProgram.title}
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              {currentProgram.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">{projects.length}</div>
                <div className="text-sm text-blue-200">Active Projects</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">
                  {projects.reduce((sum, p) => sum + p.beneficiaries, 0).toLocaleString()}
                </div>
                <div className="text-sm text-blue-200">People Impacted</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">
                  ${projects.reduce((sum, p) => sum + p.raised_amount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-blue-200">Funds Raised</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Current Projects</h2>
            <p className="text-lg text-gray-600">
              Support specific projects that align with your values and make a direct impact.
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Available</h3>
              <p className="text-gray-600">
                We're currently developing new projects for this program. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {project.beneficiaries.toLocaleString()} people
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {project.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {project.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {project.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          ${project.raised_amount.toLocaleString()} raised
                        </span>
                        <span className="text-sm text-gray-600">
                          ${project.target_amount.toLocaleString()} goal
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(project.raised_amount, project.target_amount)}%` }}
                        ></div>
                      </div>
                      <div className="text-right mt-1">
                        <span className="text-sm font-medium text-blue-600">
                          {getProgressPercentage(project.raised_amount, project.target_amount).toFixed(0)}% funded
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Link
                        to={`/donate?project=${project.id}`}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Donate Now
                      </Link>
                      <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Make a Difference Today
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Every donation, no matter the size, helps us create lasting change in communities around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/donate?program=${programId}`}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Support This Program
            </Link>
            <Link
              to="/programs"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              View All Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}