import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Edit, 
  Save, 
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface SiteSetting {
  id: string
  key: string
  value: string
  description: string | null
  is_public: boolean
}

interface NewSetting {
  key: string
  value: string
  description: string
  is_public: boolean
}

export function AdminContent() {
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSetting, setNewSetting] = useState<NewSetting>({
    key: '',
    value: '',
    description: '',
    is_public: true
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key')

      if (error) throw error
      setSettings(data || [])
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSetting = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .insert([newSetting])
        .select()
        .single()

      if (error) throw error

      setSettings([...settings, data])
      setNewSetting({ key: '', value: '', description: '', is_public: true })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding setting:', error)
      alert('Error adding setting: ' + (error as Error).message)
    }
  }

  const startEditing = (setting: SiteSetting) => {
    setEditingId(setting.id)
    setEditValue(setting.value)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditValue('')
  }

  const saveSetting = async (settingId: string) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: editValue })
        .eq('id', settingId)

      if (error) throw error

      setSettings(settings.map(setting => 
        setting.id === settingId ? { ...setting, value: editValue } : setting
      ))
      
      setEditingId(null)
      setEditValue('')
    } catch (error) {
      console.error('Error updating setting:', error)
      alert('Error updating setting: ' + (error as Error).message)
    }
  }

  const toggleVisibility = async (settingId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ is_public: !isPublic })
        .eq('id', settingId)

      if (error) throw error

      setSettings(settings.map(setting => 
        setting.id === settingId ? { ...setting, is_public: !isPublic } : setting
      ))
    } catch (error) {
      console.error('Error updating setting visibility:', error)
      alert('Error updating setting: ' + (error as Error).message)
    }
  }

  const deleteSetting = async (settingId: string) => {
    if (!confirm('Are you sure you want to delete this setting?')) return

    try {
      const { error } = await supabase
        .from('site_settings')
        .delete()
        .eq('id', settingId)

      if (error) throw error

      setSettings(settings.filter(setting => setting.id !== settingId))
    } catch (error) {
      console.error('Error deleting setting:', error)
      alert('Error deleting setting: ' + (error as Error).message)
    }
  }

  const contentSections = [
    {
      title: 'Site Information',
      settings: settings.filter(s => ['site_name', 'site_description'].includes(s.key))
    },
    {
      title: 'Contact Information',
      settings: settings.filter(s => ['contact_email', 'contact_phone', 'contact_address'].includes(s.key))
    },
    {
      title: 'Social Media',
      settings: settings.filter(s => ['facebook_url', 'twitter_url', 'instagram_url'].includes(s.key))
    },
    {
      title: 'Goals & Targets',
      settings: settings.filter(s => ['donation_goal', 'volunteer_goal'].includes(s.key))
    },
    {
      title: 'Other Settings',
      settings: settings.filter(s => !['site_name', 'site_description', 'contact_email', 'contact_phone', 'contact_address', 'facebook_url', 'twitter_url', 'instagram_url', 'donation_goal', 'volunteer_goal'].includes(s.key))
    }
  ]

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
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-2">Manage website content and settings</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Setting
          </button>
        </div>
      </div>

      {/* Add Setting Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add New Setting</h2>
              <button onClick={() => setShowAddForm(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={addSetting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                <input
                  type="text"
                  required
                  value={newSetting.key}
                  onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="setting_key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <textarea
                  required
                  value={newSetting.value}
                  onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newSetting.description}
                  onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Description of this setting"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={newSetting.is_public}
                  onChange={(e) => setNewSetting({...newSetting, is_public: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                  Public setting
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Setting
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

      {/* Content Sections */}
      <div className="space-y-8">
        {contentSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{section.title}</h2>
            
            {section.settings.length === 0 ? (
              <p className="text-gray-500 italic">No settings in this section</p>
            ) : (
              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            setting.is_public 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {setting.is_public ? 'Public' : 'Private'}
                          </span>
                        </div>
                        
                        {setting.description && (
                          <p className="text-xs text-gray-500 mb-3">{setting.description}</p>
                        )}
                        
                        {editingId === setting.id ? (
                          <div className="flex items-center space-x-2">
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                            />
                            <button
                              onClick={() => saveSetting(setting.id)}
                              className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                            {setting.value}
                          </div>
                        )}
                      </div>
                      
                      {editingId !== setting.id && (
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleVisibility(setting.id, setting.is_public)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                            title={setting.is_public ? 'Make Private' : 'Make Public'}
                          >
                            {setting.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => startEditing(setting)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteSetting(setting.id)}
                            className="p-2 text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
            <FileText className="h-5 w-5 mr-2" />
            Export Settings
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
            <Plus className="h-5 w-5 mr-2" />
            Import Settings
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
            <Save className="h-5 w-5 mr-2" />
            Backup Content
          </button>
        </div>
      </div>
    </div>
  )
}