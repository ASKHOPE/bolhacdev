import React, { useState, useEffect } from 'react'
import { 
  FolderOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  X,
  Save,
  BookOpen,
  Heart,
  Droplets,
  Home,
  Users,
  Lightbulb
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

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

interface NewProgram {
  title: string
  description: string
  category: string
  customCategory: string
  image_url: string
  published: boolean
  featured: boolean
}

export function AdminPrograms() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [newProgram, setNewProgram] = useState<NewProgram>({
    title: '',
    description: '',
    category: 'education',
    customCategory: '',
    image_url: '',
    published: false,
    featured: false
  })

  const defaultCategoryOptions = [
    { value: 'education', label: 'Education Initiative', icon: BookOpen },
    { value: 'healthcare', label: 'Healthcare Access', icon: Heart },
    { value: 'clean-water', label: 'Clean Water Project', icon: Droplets },
    { value: 'housing', label: 'Housing Development', icon: Home },
    { value: 'community-empowerment', label: 'Community Empowerment', icon: Users },
    { value: 'innovation', label: 'Innovation Lab', icon: Lightbulb },
    { value: 'custom', label: 'Add New Category...', icon: Plus }
  ]

  // Get unique categories from existing programs
  const getExistingCategories = () => {
    const existingCategories = [...new Set(programs.map(p => p.category))]
    const customCategories = existingCategories.filter(cat => 
      !defaultCategoryOptions.some(opt => opt.value === cat && opt.value !== 'custom')
    )
    
    return customCategories.map(cat => ({
      value: cat,
      label: cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      icon: FolderOpen
    }))
  }

  const allCategoryOptions = [
    ...defaultCategoryOptions.filter(opt => opt.value !== 'custom'),
    ...getExistingCategories(),
    { value: 'custom', label: 'Add New Category...', icon: Plus }
  ]

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPrograms(data || [])
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const addProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Determine the final category
      const finalCategory = newProgram.category === 'custom' 
        ? newProgram.customCategory.toLowerCase().replace(/\s+/g, '-')
        : newProgram.category

      if (newProgram.category === 'custom' && !newProgram.customCategory.trim()) {
        alert('Please enter a custom category name')
        setSubmitting(false)
        return
      }

      const { data, error } = await supabase
        .from('programs')
        .insert([{
          title: newProgram.title,
          description: newProgram.description,
          category: finalCategory,
          image_url: newProgram.image_url || null,
          published: newProgram.published,
          featured: newProgram.featured
        }])
        .select()
        .single()

      if (error) throw error

      setPrograms([data, ...programs])
      setNewProgram({
        title: '',
        description: '',
        category: 'education',
        customCategory: '',
        image_url: '',
        published: false,
        featured: false
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding program:', error)
      alert('Error adding program: ' + (error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const updateProgram = async (programId: string, updates: Partial<Program>) => {
    setSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('programs')
        .update(updates)
        .eq('id', programId)

      if (error) throw error
      
      setPrograms(programs.map(program => 
        program.id === programId ? { ...program, ...updates } : program
      ))
      setEditingProgram(null)
    } catch (error) {
      console.error('Error updating program:', error)
      alert('Error updating program: ' + (error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleProgramStatus = async (programId: string, published: boolean) => {
    await updateProgram(programId, { published: !published })
  }

  const deleteProgram = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program? This will also affect related projects.')) return

    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', programId)

      if (error) throw error
      
      setPrograms(programs.filter(program => program.id !== programId))
    } catch (error) {
      console.error('Error deleting program:', error)
      alert('Error deleting program: ' + (error as Error).message)
    }
  }

  const getCategoryIcon = (category: string) => {
    const categoryOption = allCategoryOptions.find(opt => opt.value === category)
    return categoryOption ? categoryOption.icon : FolderOpen
  }

  const getCategoryLabel = (category: string) => {
    const categoryOption = allCategoryOptions.find(opt => opt.value === category)
    return categoryOption ? categoryOption.label : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const handleStatusFilterClick = (filter: 'all' | 'published' | 'draft' | 'featured') => {
    setStatusFilter(filter)
  }

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    switch (statusFilter) {
      case 'published':
        matchesStatus = program.published
        break
      case 'draft':
        matchesStatus = !program.published
        break
      case 'featured':
        matchesStatus = program.featured
        break
      default:
        matchesStatus = true
    }
    
    return matchesSearch && matchesStatus
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
            <h1 className="text-3xl font-bold text-gray-900">Program Management</h1>
            <p className="text-gray-600 mt-2">Create and manage program categories</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </button>
        </div>
      </div>

      {/* Add Program Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New Program</h2>
              <button onClick={() => setShowAddForm(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={addProgram} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newProgram.title}
                  onChange={(e) => setNewProgram({...newProgram, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Program title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Program description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={newProgram.category}
                  onChange={(e) => setNewProgram({...newProgram, category: e.target.value, customCategory: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {allCategoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Custom Category Input */}
              {newProgram.category === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Category Name *</label>
                  <input
                    type="text"
                    required
                    value={newProgram.customCategory}
                    onChange={(e) => setNewProgram({...newProgram, customCategory: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new category name (e.g., Environmental Protection)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will create a new category that can be used for future programs
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProgram.image_url}
                  onChange={(e) => setNewProgram({...newProgram, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={newProgram.published}
                    onChange={(e) => setNewProgram({...newProgram, published: e.target.checked})}
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
                    checked={newProgram.featured}
                    onChange={(e) => setNewProgram({...newProgram, featured: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Featured program
                  </label>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Program'}
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

      {/* Edit Program Modal */}
      {editingProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Program</h2>
              <button onClick={() => setEditingProgram(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              updateProgram(editingProgram.id, {
                title: editingProgram.title,
                description: editingProgram.description,
                category: editingProgram.category,
                image_url: editingProgram.image_url,
                published: editingProgram.published,
                featured: editingProgram.featured
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingProgram.title}
                  onChange={(e) => setEditingProgram({...editingProgram, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={editingProgram.description}
                  onChange={(e) => setEditingProgram({...editingProgram, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  required
                  value={editingProgram.category}
                  onChange={(e) => setEditingProgram({...editingProgram, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Category (e.g., education, healthcare)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can edit the category directly or use kebab-case (e.g., environmental-protection)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingProgram.image_url || ''}
                  onChange={(e) => setEditingProgram({...editingProgram, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_published"
                    checked={editingProgram.published}
                    onChange={(e) => setEditingProgram({...editingProgram, published: e.target.checked})}
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
                    checked={editingProgram.featured}
                    onChange={(e) => setEditingProgram({...editingProgram, featured: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit_featured" className="ml-2 block text-sm text-gray-900">
                    Featured program
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
                  onClick={() => setEditingProgram(null)}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <button
          onClick={() => handleStatusFilterClick('all')}
          className={`bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow ${
            statusFilter === 'all' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Programs</p>
              <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatusFilterClick('published')}
          className={`bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow ${
            statusFilter === 'published' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.filter(p => p.published).length}
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatusFilterClick('draft')}
          className={`bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow ${
            statusFilter === 'draft' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <EyeOff className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.filter(p => !p.published).length}
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleStatusFilterClick('featured')}
          className={`bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow ${
            statusFilter === 'featured' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FolderOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.filter(p => p.featured).length}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Programs</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Programs Found</h3>
          <p className="text-gray-600">
            {programs.length === 0 
              ? "No programs have been created yet. Create your first program to get started."
              : "No programs match your current search and filter criteria."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => {
            const CategoryIcon = getCategoryIcon(program.category)
            return (
              <div key={program.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={program.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={program.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      program.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {program.published ? 'Published' : 'Draft'}
                    </span>
                    {program.featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <CategoryIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {program.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {program.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    Category: {getCategoryLabel(program.category)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleProgramStatus(program.id, program.published)}
                      className={`flex items-center px-3 py-1 rounded text-xs font-medium transition-colors ${
                        program.published
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {program.published ? (
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
                        onClick={() => setEditingProgram(program)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteProgram(program.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}