import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Heart, MapPin, Calendar, Target, Users, DollarSign, CheckCircle, ExternalLink, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
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
  image_gallery: string[]
  show_gallery: boolean
  beneficiaries: number
  program_category: string
}

interface Program {
  id: string
  title: string
  description: string
  category: string
}

export function ProgramDetail() {
  const { programId } = useParams<{ programId: string }>()
  const [projects, setProjects] = useState<Project[]>([])
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (programId) {
      fetchData()
    }
  }, [programId])

  const fetchData = async () => {
    try {
      // Fetch program details and projects
      const [programResult, projectsResult] = await Promise.all([
        supabase
          .from('programs')
          .select('*')
          .eq('category', programId)
          .eq('published', true)
          .single(),
        supabase
          .from('projects')
          .select('*')
          .eq('program_category', programId)
          .eq('published', true)
          .order('created_at', { ascending: false })
      ])

      if (programResult.error && programResult.error.code !== 'PGRST116') {
        throw programResult.error
      }
      if (projectsResult.error) throw projectsResult.error

      setProgram(programResult.data)
      
      // Add default values for new fields if they don't exist
      const projectsWithDefaults = (projectsResult.data || []).map(project => ({
        ...project,
        image_gallery: project.image_gallery || [],
        show_gallery: project.show_gallery !== undefined ? project.show_gallery : true
      }))
      
      setProjects(projectsWithDefaults)
    } catch (error) {
      console.error('Error fetching data:', error)
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

  const getAllProjectImages = (project: Project) => {
    const images = []
    if (project.image_url) {
      images.push(project.image_url)
    }
    if (project.image_gallery && project.show_gallery) {
      images.push(...project.image_gallery)
    }
    return images
  }

  const nextImage = () => {
    if (selectedProject) {
      const images = getAllProjectImages(selectedProject)
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (selectedProject) {
      const images = getAllProjectImages(selectedProject)
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const openProjectModal = (project: Project) => {
    setSelectedProject(project)
    setCurrentImageIndex(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!program && !programId) {
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

  // Fallback program info if not found in database
  const displayProgram = program || {
    title: programId?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Program',
    description: 'Comprehensive initiatives designed to create lasting change and empower communities worldwide.',
    category: programId || ''
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
              {displayProgram.title}
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              {displayProgram.description}
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
                  <div className="relative">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                    {project.image_gallery && project.show_gallery && project.image_gallery.length > 0 && (
                      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <ImageIcon className="h-4 w-4 mr-1" />
                        {project.image_gallery.length + 1} photos
                      </div>
                    )}
                  </div>
                  
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
                      <button 
                        onClick={() => openProjectModal(project)}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
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

      {/* Enhanced Project Detail Modal with Image Gallery */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Image Gallery Section */}
            <div className="relative">
              {(() => {
                const images = getAllProjectImages(selectedProject)
                return images.length > 0 ? (
                  <div className="relative">
                    <img
                      src={images[currentImageIndex]}
                      alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                    
                    {/* Close Button */}
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative h-64 bg-gray-200 flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )
              })()}
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status === 'completed' && <CheckCircle className="h-4 w-4 mr-1" />}
                  {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                </span>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span className="font-medium">{selectedProject.beneficiaries.toLocaleString()} people impacted</span>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {selectedProject.title}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                      <span>{selectedProject.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                      <span>
                        {new Date(selectedProject.start_date).toLocaleDateString()} - {new Date(selectedProject.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Target className="h-5 w-5 mr-3 text-blue-600" />
                      <span>Target: ${selectedProject.target_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Project Description</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {selectedProject.description}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      This project represents our commitment to creating sustainable change in the community. 
                      Through careful planning and community engagement, we aim to deliver lasting impact that 
                      will benefit generations to come. Your support helps us turn this vision into reality.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Funding Progress</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Raised: ${selectedProject.raised_amount.toLocaleString()}</span>
                        <span>Goal: ${selectedProject.target_amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(selectedProject.raised_amount, selectedProject.target_amount)}%` }}
                        ></div>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {getProgressPercentage(selectedProject.raised_amount, selectedProject.target_amount).toFixed(0)}% Complete
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Project Impact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {selectedProject.beneficiaries.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-700">People Served</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {Math.ceil((new Date(selectedProject.end_date).getTime() - new Date(selectedProject.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))}
                        </div>
                        <div className="text-sm text-green-700">Months Duration</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Thumbnails */}
              {(() => {
                const images = getAllProjectImages(selectedProject)
                return selectedProject.show_gallery && images.length > 1 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Project Gallery ({images.length} images)
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {images.map((imageUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative group ${
                            currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt={`${selectedProject.title} - Thumbnail ${index + 1}`}
                            className="w-full h-16 object-cover rounded border hover:opacity-80 transition-opacity"
                          />
                          {currentImageIndex === index && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Key Achievements */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Achievements & Milestones</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Community Engagement</p>
                      <p className="text-sm text-gray-600">Successfully engaged with local community leaders and stakeholders</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Resource Planning</p>
                      <p className="text-sm text-gray-600">Completed comprehensive resource assessment and planning phase</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Partnership Development</p>
                      <p className="text-sm text-gray-600">Established partnerships with local organizations and government agencies</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  to={`/donate?project=${selectedProject.id}`}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Support This Project
                </Link>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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