import React, { useState, useEffect } from 'react'
import { 
  Target, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  MapPin,
  Users,
  DollarSign,
  X,
  Save,
  Calendar,
  CheckCircle,
  Image as ImageIcon,
  Upload
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

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
  image_url: string | null
  image_gallery: string[]
  show_gallery: boolean
  beneficiaries: number
  program_category: string
  published: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

interface Program {
  id: string
  title: string
  category: string
}

interface NewProject {
  title: string
  description: string
  location: string
  target_amount: number
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'upcoming'
  image_url: string
  image_gallery: string[]
  show_gallery: boolean
  beneficiaries: number
  program_category: string
  published: boolean
  featured: boolean
}

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'active' | 'upcoming' | 'completed' | 'featured'>('all')
  const [programFilter, setProgramFilter] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [newProject, setNewProject] = useState<NewProject>({
    title: '',
    description: '',
    location: '',
    target_amount: 0,
    start_date: '',
    end_date: '',
    status: 'upcoming',
    image_url: '',
    image_gallery: [],
    show_gallery: true,
    beneficiaries: 0,
    program_category: '',
    published: false,
    featured: false
  })

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch both projects and programs
      const [projectsResult, programsResult] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('programs').select('id, title, category').eq('published', true)
      ])

      if (projectsResult.error) throw projectsResult.error
      if (programsResult.error) throw programsResult.error

      // Add default values for new fields if they don't exist
      const projectsWithDefaults = (projectsResult.data || []).map(project => ({
        ...project,
        image_gallery: project.image_gallery || [],
        show_gallery: project.show_gallery !== undefined ? project.show_gallery : true
      }))

      setProjects(projectsWithDefaults)
      setPrograms(programsResult.data || [])

      // Set default category if programs exist
      if (programsResult.data && programsResult.data.length > 0 && !newProject.program_category) {
        setNewProject(prev => ({ ...prev, program_category: programsResult.data[0].category }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          title: newProject.title,
          description: newProject.description,
          location: newProject.location,
          target_amount: newProject.target_amount,
          start_date: newProject.start_date,
          end_date: newProject.end_date,
          status: newProject.status,
          image_url: newProject.image_url || null,
          image_gallery: newProject.image_gallery,
          show_gallery: newProject.show_gallery,
          beneficiaries: newProject.beneficiaries,
          program_category: newProject.program_category,
          published: newProject.published,
          featured: newProject.featured,
          raised_amount: 0
        }])
        .select()
        .single()

      if (error) throw error

      setProjects([{ ...data, image_gallery: data.image_gallery || [], show_gallery: data.show_gallery !== undefined ? data.show_gallery : true }, ...projects])
      setNewProject({
        title: '',
        description: '',
        location: '',
        target_amount: 0,
        start_date: '',
        end_date: '',
        status: 'upcoming',
        image_url: '',
        image_gallery: [],
        show_gallery: true,
        beneficiaries: 0,
        program_category: programs.length > 0 ? programs[0].category : '',
        published: false,
        featured: false
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding project:', error)
      alert('Error adding project: ' + (error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    setSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)

      if (error) throw error
      
      setProjects(projects.map(project => 
        project.id === projectId ? { ...project, ...updates } : project
      ))
      setEditingProject(null)
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Error updating project: ' + (error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleProjectStatus = async (projectId: string, published: boolean) => {
    await updateProject(projectId, { published: !published })
  }

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      
      setProjects(projects.filter(project => project.id !== projectId))
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project: ' + (error as Error).message)
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

  const getProgramTitle = (category: string) => {
    const program = programs.find(p => p.category === category)
    return program ? program.title : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const handleStatusFilterClick = (filter: 'all' | 'published' | 'draft' | 'active' | 'upcoming' | 'completed' | 'featured') => {
    setStatusFilter(filter)
  }

  const addImageToGallery = (projectData: NewProject | Project, setProjectData: Function) => {
    const imageUrl = prompt('Enter image URL:')
    if (imageUrl && imageUrl.trim()) {
      setProjectData({
        ...projectData,
        image_gallery: [...(projectData.image_gallery || []), imageUrl.trim()]
      })
    }
  }

  const removeImageFromGallery = (projectData: NewProject | Project, setProjectData: Function, index: number) => {
    setProjectData({
      ...projectData,
      image_gallery: projectData.image_gallery.filter((_, i) => i !== index)
    })
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setProgramFilter('all')
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    switch (statusFilter) {
      case 'published':
        matchesStatus = project.published
        break
      case 'draft':
        matchesStatus = !project.published
        break
      case 'active':
        matchesStatus = project.status === 'active'
        break
      case 'upcoming':
        matchesStatus = project.status === 'upcoming'
        break
      case 'completed':
        matchesStatus = project.status === 'completed'
        break
      case 'featured':
        matchesStatus = project.featured
        break
      default:
        matchesStatus = true
    }
    
    const matchesProgram = programFilter === 'all' || project.program_category === programFilter
    return matchesSearch && matchesStatus && matchesProgram
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
            <p className="text-gray-600 mt-2">Create and manage individual projects with image galleries</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </button>
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New Project</h2>
              <button onClick={() => setShowAddForm(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={addProject} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Project title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Project description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={newProject.location}
                    onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Project location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Category *</label>
                  <select
                    required
                    value={newProject.program_category}
                    onChange={(e) => setNewProject({...newProject, program_category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a program</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.category}>
                        {program.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount ($) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProject.target_amount}
                    onChange={(e) => setNewProject({...newProject, target_amount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiaries *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProject.beneficiaries}
                    onChange={(e) => setNewProject({...newProject, beneficiaries: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newProject.start_date}
                    onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={newProject.end_date}
                    onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    required
                    value={newProject.status}
                    onChange={(e) => setNewProject({...newProject, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL</label>
                  <input
                    type="url"
                    value={newProject.image_url}
                    onChange={(e) => setNewProject({...newProject, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Image Gallery Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Project Image Gallery</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="show_gallery"
                        checked={newProject.show_gallery}
                        onChange={(e) => setNewProject({...newProject, show_gallery: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="show_gallery" className="ml-2 block text-sm text-gray-900">
                        Show gallery in project details
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => addImageToGallery(newProject, setNewProject)}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Image
                    </button>
                  </div>
                </div>
                
                {newProject.image_gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {newProject.image_gallery.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageFromGallery(newProject, setNewProject, index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No images added to gallery yet</p>
                    <p className="text-sm text-gray-400">Click "Add Image" to start building your gallery</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={newProject.published}
                    onChange={(e) => setNewProject({...newProject, published: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                    Publish immediately
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newProject.featured}
                    onChange={(e) => setNewProject({...newProject, featured: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Featured project
                  </label>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Project</h2>
              <button onClick={() => setEditingProject(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              updateProject(editingProject.id, {
                title: editingProject.title,
                description: editingProject.description,
                location: editingProject.location,
                target_amount: editingProject.target_amount,
                raised_amount: editingProject.raised_amount,
                start_date: editingProject.start_date,
                end_date: editingProject.end_date,
                status: editingProject.status,
                image_url: editingProject.image_url,
                image_gallery: editingProject.image_gallery,
                show_gallery: editingProject.show_gallery,
                beneficiaries: editingProject.beneficiaries,
                program_category: editingProject.program_category,
                published: editingProject.published,
                featured: editingProject.featured
              })
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={editingProject.location}
                    onChange={(e) => setEditingProject({...editingProject, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Category *</label>
                  <select
                    required
                    value={editingProject.program_category}
                    onChange={(e) => setEditingProject({...editingProject, program_category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {programs.map(program => (
                      <option key={program.id} value={program.category}>
                        {program.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount ($) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingProject.target_amount}
                    onChange={(e) => setEditingProject({...editingProject, target_amount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raised Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProject.raised_amount}
                    onChange={(e) => setEditingProject({...editingProject, raised_amount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiaries *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingProject.beneficiaries}
                    onChange={(e) => setEditingProject({...editingProject, beneficiaries: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={editingProject.start_date}
                    onChange={(e) => setEditingProject({...editingProject, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={editingProject.end_date}
                    onChange={(e) => setEditingProject({...editingProject, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    required
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({...editingProject, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL</label>
                  <input
                    type="url"
                    value={editingProject.image_url || ''}
                    onChange={(e) => setEditingProject({...editingProject, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Image Gallery Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Project Image Gallery</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit_show_gallery"
                        checked={editingProject.show_gallery}
                        onChange={(e) => setEditingProject({...editingProject, show_gallery: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit_show_gallery" className="ml-2 block text-sm text-gray-900">
                        Show gallery in project details
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => addImageToGallery(editingProject, setEditingProject)}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Image
                    </button>
                  </div>
                </div>
                
                {editingProject.image_gallery && editingProject.image_gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {editingProject.image_gallery.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageFromGallery(editingProject, setEditingProject, index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No images in gallery</p>
                    <p className="text-sm text-gray-400">Click "Add Image" to add images to the gallery</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_published"
                    checked={editingProject.published}
                    onChange={(e) => setEditingProject({...editingProject, published: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit_published" className="ml-2 block text-sm text-gray-900">
                    Published
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_featured"
                    checked={editingProject.featured}
                    onChange={(e) => setEditingProject({...editingProject, featured: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit_featured" className="ml-2 block text-sm text-gray-900">
                    Featured project
                  </label>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats - Now Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <button
          onClick={() => handleStatusFilterClick('all')}
          className={`bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-all transform hover:scale-105 ${
            statusFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatusFilterClick('active')}
          className={`bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-all transform hover:scale-105 ${
            statusFilter === 'active' ? 'ring-2 ring-blue-500 bg-green-50' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatusFilterClick('upcoming')}
          className={`bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-all transform hover:scale-105 ${
            statusFilter === 'upcoming' ? 'ring-2 ring-blue-500 bg-yellow-50' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.status === 'upcoming').length}
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatusFilterClick('published')}
          className={`bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-all transform hover:scale-105 ${
            statusFilter === 'published' ? 'ring-2 ring-blue-500 bg-purple-50' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.published).length}
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatusFilterClick('featured')}
          className={`bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-all transform hover:scale-105 ${
            statusFilter === 'featured' ? 'ring-2 ring-blue-500 bg-indigo-50' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <Target className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.featured).length}
              </p>
            </div>
          </div>
        </button>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Raised</p>
              <p className="text-2xl font-bold text-gray-900">
                ${projects.reduce((sum, p) => sum + p.raised_amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="featured">Featured</option>
            </select>
          </div>
          <div>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Programs</option>
              {programs.map(program => (
                <option key={program.id} value={program.category}>
                  {program.title}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={clearAllFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear All Filters
          </button>
          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
          <p className="text-gray-600 mb-4">
            {projects.length === 0 
              ? "No projects have been created yet. Create your first project to get started."
              : "No projects match your current search and filter criteria."
            }
          </p>
          {projects.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:scale-105">
              <div className="relative">
                <img
                  src={project.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                {project.image_gallery && project.show_gallery && project.image_gallery.length > 0 && (
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {project.image_gallery.length + 1} photos
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {project.published && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">Published</span>
                  )}
                  {project.featured && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">Featured</span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {project.beneficiaries.toLocaleString()}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {project.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="space-y-1 mb-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {project.location}
                  </div>
                  <div>
                    Program: {getProgramTitle(project.program_category)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      ${project.raised_amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-600">
                      ${project.target_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(project.raised_amount, project.target_amount)}%` }}
                    ></div>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs font-medium text-blue-600">
                      {getProgressPercentage(project.raised_amount, project.target_amount).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleProjectStatus(project.id, project.published)}
                    className={`flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                      project.published
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {project.published ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Publish
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setEditingProject(project)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Edit Project"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteProject(project.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}