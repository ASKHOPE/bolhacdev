import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Edit, 
  Save, 
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Globe,
  Settings,
  Palette,
  Type,
  Link as LinkIcon,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSiteSettings } from '../../hooks/useSiteSettings'

interface SiteSetting {
  id: string
  key: string
  value: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
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
  const [activeTab, setActiveTab] = useState('general')
  const [newSetting, setNewSetting] = useState<NewSetting>({
    key: '',
    value: '',
    description: '',
    is_public: true
  })
  const { refetch: refetchSiteSettings } = useSiteSettings()

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'branding', name: 'Branding', icon: Palette },
    { id: 'content', name: 'Content', icon: Type },
    { id: 'social', name: 'Social Media', icon: Globe },
    { id: 'advanced', name: 'Advanced', icon: FileText },
  ]

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
      
      // Refresh site settings in the app
      refetchSiteSettings()
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
        .update({ value: editValue, updated_at: new Date().toISOString() })
        .eq('id', settingId)

      if (error) throw error

      setSettings(settings.map(setting => 
        setting.id === settingId ? { ...setting, value: editValue, updated_at: new Date().toISOString() } : setting
      ))
      
      setEditingId(null)
      setEditValue('')
      
      // Refresh site settings in the app
      refetchSiteSettings()
    } catch (error) {
      console.error('Error updating setting:', error)
      alert('Error updating setting: ' + (error as Error).message)
    }
  }

  const toggleVisibility = async (settingId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ is_public: !isPublic, updated_at: new Date().toISOString() })
        .eq('id', settingId)

      if (error) throw error

      setSettings(settings.map(setting => 
        setting.id === settingId ? { ...setting, is_public: !isPublic, updated_at: new Date().toISOString() } : setting
      ))
      
      // Refresh site settings in the app
      refetchSiteSettings()
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
      
      // Refresh site settings in the app
      refetchSiteSettings()
    } catch (error) {
      console.error('Error deleting setting:', error)
      alert('Error deleting setting: ' + (error as Error).message)
    }
  }

  const handleImageUpload = async (settingKey: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // In a real application, you would upload to a storage service
      // For now, we'll use a placeholder URL
      const imageUrl = `https://via.placeholder.com/400x200?text=${encodeURIComponent(file.name)}`
      
      // Update the setting with the image URL
      const setting = settings.find(s => s.key === settingKey)
      if (setting) {
        setEditingId(setting.id)
        setEditValue(imageUrl)
        await saveSetting(setting.id)
      } else {
        // Create new setting
        const newImageSetting = {
          key: settingKey,
          value: imageUrl,
          description: `${settingKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} image`,
          is_public: true
        }
        
        try {
          const { data, error } = await supabase
            .from('site_settings')
            .insert([newImageSetting])
            .select()
            .single()

          if (error) throw error
          setSettings([...settings, data])
          
          // Refresh site settings in the app
          refetchSiteSettings()
        } catch (error) {
          console.error('Error adding image setting:', error)
        }
      }
    }
    input.click()
  }

  const getSettingsByCategory = (category: string) => {
    const categoryMappings = {
      general: ['site_name', 'site_description', 'site_tagline', 'contact_email', 'contact_phone', 'contact_address'],
      branding: ['logo_url', 'favicon_url', 'primary_color', 'secondary_color', 'font_family'],
      content: ['hero_title', 'hero_subtitle', 'about_text', 'mission_statement', 'vision_statement'],
      social: ['facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url'],
      advanced: []
    }
    
    const categoryKeys = categoryMappings[category as keyof typeof categoryMappings] || []
    const categorySettings = settings.filter(s => categoryKeys.includes(s.key))
    const otherSettings = category === 'advanced' ? settings.filter(s => !Object.values(categoryMappings).flat().includes(s.key)) : []
    
    return [...categorySettings, ...otherSettings]
  }

  const getSetting = (key: string) => {
    return settings.find(s => s.key === key)
  }

  const renderSettingInput = (setting: SiteSetting) => {
    if (editingId === setting.id) {
      if (setting.key.includes('color')) {
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="#000000"
            />
          </div>
        )
      } else if (setting.key.includes('url') && setting.key !== 'logo_url' && setting.key !== 'favicon_url') {
        return (
          <input
            type="url"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
          />
        )
      } else if (setting.key.includes('description') || setting.key.includes('text') || setting.key.includes('statement')) {
        return (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        )
      } else {
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )
      }
    }

    if (setting.key.includes('color')) {
      return (
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 border border-gray-300 rounded"
            style={{ backgroundColor: setting.value }}
          ></div>
          <span className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded border font-mono">
            {setting.value}
          </span>
        </div>
      )
    } else if (setting.key === 'logo_url' || setting.key === 'favicon_url') {
      return (
        <div className="space-y-2">
          {setting.value && (
            <img 
              src={setting.value} 
              alt={setting.key}
              className={`border border-gray-300 rounded ${
                setting.key === 'favicon_url' ? 'w-8 h-8' : 'w-32 h-16 object-contain'
              }`}
            />
          )}
          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border break-all">
            {setting.value || 'No image uploaded'}
          </div>
        </div>
      )
    } else {
      return (
        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
          {setting.value}
        </div>
      )
    }
  }

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
            <p className="text-gray-600 mt-2">Manage website content, branding, and settings</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchSettings}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Setting
            </button>
          </div>
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

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Site Name */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Site Name</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">The name of your organization</p>
                
                {(() => {
                  const setting = getSetting('site_name')
                  return setting ? (
                    <div>
                      {renderSettingInput(setting)}
                      <div className="flex justify-end space-x-2 mt-3">
                        {editingId === setting.id ? (
                          <>
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
                          </>
                        ) : (
                          <button
                            onClick={() => startEditing(setting)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Not set</div>
                  )
                })()}
              </div>

              {/* Site Description */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Site Description</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Brief description of your organization</p>
                
                {(() => {
                  const setting = getSetting('site_description')
                  return setting ? (
                    <div>
                      {renderSettingInput(setting)}
                      <div className="flex justify-end space-x-2 mt-3">
                        {editingId === setting.id ? (
                          <>
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
                          </>
                        ) : (
                          <button
                            onClick={() => startEditing(setting)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Not set</div>
                  )
                })()}
              </div>

              {/* Contact Email */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Contact Email</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Primary contact email address</p>
                
                {(() => {
                  const setting = getSetting('contact_email')
                  return setting ? (
                    <div>
                      {renderSettingInput(setting)}
                      <div className="flex justify-end space-x-2 mt-3">
                        {editingId === setting.id ? (
                          <>
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
                          </>
                        ) : (
                          <button
                            onClick={() => startEditing(setting)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Not set</div>
                  )
                })()}
              </div>

              {/* Contact Phone */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Contact Phone</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Primary contact phone number</p>
                
                {(() => {
                  const setting = getSetting('contact_phone')
                  return setting ? (
                    <div>
                      {renderSettingInput(setting)}
                      <div className="flex justify-end space-x-2 mt-3">
                        {editingId === setting.id ? (
                          <>
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
                          </>
                        ) : (
                          <button
                            onClick={() => startEditing(setting)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Not set</div>
                  )
                })()}
              </div>
              
              {/* Contact Address */}
              <div className="border border-gray-200 rounded-lg p-4 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Contact Address</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Organization physical address</p>
                
                {(() => {
                  const setting = getSetting('contact_address')
                  return setting ? (
                    <div>
                      {renderSettingInput(setting)}
                      <div className="flex justify-end space-x-2 mt-3">
                        {editingId === setting.id ? (
                          <>
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
                          </>
                        ) : (
                          <button
                            onClick={() => startEditing(setting)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Not set</div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Branding & Visual Identity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Logo</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Organization logo (recommended: 400x200px)</p>
                
                {(() => {
                  const setting = getSetting('logo_url')
                  return (
                    <div>
                      {setting && renderSettingInput(setting)}
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => handleImageUpload('logo_url')}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </button>
                        {setting && editingId !== setting.id && (
                          <button
                            onClick={() => startEditing(setting)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Favicon Upload */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Favicon</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Browser tab icon (recommended: 32x32px)</p>
                
                {(() => {
                  const setting = getSetting('favicon_url')
                  return (
                    <div>
                      {setting && renderSettingInput(setting)}
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => handleImageUpload('favicon_url')}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Favicon
                        </button>
                        {setting && editingId !== setting.id && (
                          <button
                            onClick={() => startEditing(setting)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Primary Color */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Primary Color</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Main brand color</p>
                
                {(() => {
                  const setting = getSetting('primary_color')
                  return setting ? (
                    <div>
                      {renderSettingInput(setting)}
                      <div className="flex justify-end space-x-2 mt-3">
                        {editingId === setting.id ? (
                          <>
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
                          </>
                        ) : (
                          <button
                            onClick={() => startEditing(setting)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Not set</div>
                  )
                })()}
              </div>

              {/* Secondary Color */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Secondary Color</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Secondary brand color</p>
                
                {(() => {
                  const setting = getSetting('secondary_color')
                  return setting ? (
                    <div>
                      {renderSettingInput(setting)}
                      <div className="flex justify-end space-x-2 mt-3">
                        {editingId === setting.id ? (
                          <>
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
                          </>
                        ) : (
                          <button
                            onClick={() => startEditing(setting)}
                            className="p-2 text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Not set</div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Social Media Links</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url'].map((socialKey) => (
                <div key={socialKey} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {socialKey.replace('_url', '').charAt(0).toUpperCase() + socialKey.replace('_url', '').slice(1)}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Public
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {socialKey.replace('_url', '').charAt(0).toUpperCase() + socialKey.replace('_url', '').slice(1)} profile URL
                  </p>
                  
                  {(() => {
                    const setting = getSetting(socialKey)
                    return setting ? (
                      <div>
                        {renderSettingInput(setting)}
                        <div className="flex justify-end space-x-2 mt-3">
                          {editingId === setting.id ? (
                            <>
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
                            </>
                          ) : (
                            <button
                              onClick={() => startEditing(setting)}
                              className="p-2 text-gray-600 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">Not set</div>
                    )
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Advanced Settings</h2>
            
            <div className="space-y-4">
              {getSettingsByCategory('advanced').map((setting) => (
                <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
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
                      
                      {renderSettingInput(setting)}
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
                    
                    {editingId === setting.id && (
                      <div className="flex items-center space-x-2 ml-4">
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
            <FileText className="h-5 w-5 mr-2" />
            Export Settings
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
            <Upload className="h-5 w-5 mr-2" />
            Import Settings
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
            <Save className="h-5 w-5 mr-2" />
            Backup Content
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
            <Globe className="h-5 w-5 mr-2" />
            Preview Site
          </button>
        </div>
      </div>
    </div>
  )
}