import React, { useState, useEffect } from 'react'
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Save, 
  RotateCcw, 
  Download, 
  Upload,
  Eye,
  Settings,
  Type,
  Zap,
  Wrench,
  AlertTriangle,
  Plus,
  Minus,
  Copy,
  Check,
  Layout,
  Layers,
  Image,
  RefreshCw
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'

interface PageBackground {
  page: string
  background: string
  description: string
}

export function AdminTheme() {
  const { theme, maintenance, updateTheme, updateMaintenance, resetTheme, exportTheme, importTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('appearance')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [newExcludedPage, setNewExcludedPage] = useState('')
  const [pageBackgrounds, setPageBackgrounds] = useState<PageBackground[]>([
    { page: 'home', background: '#ffffff', description: 'Home page background' },
    { page: 'about', background: '#ffffff', description: 'About page background' },
    { page: 'programs', background: '#ffffff', description: 'Programs page background' },
    { page: 'events', background: '#ffffff', description: 'Events page background' },
    { page: 'donate', background: '#ffffff', description: 'Donate page background' },
    { page: 'contact', background: '#ffffff', description: 'Contact page background' }
  ])
  const [loadingBackgrounds, setLoadingBackgrounds] = useState(true)

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'typography', name: 'Typography', icon: Type },
    { id: 'effects', name: 'Effects', icon: Zap },
    { id: 'pages', name: 'Page Backgrounds', icon: Layout },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench },
  ]

  useEffect(() => {
    fetchPageBackgrounds()
  }, [])

  const fetchPageBackgrounds = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value, description')
        .like('key', 'page_bg_%')

      if (error) throw error

      if (data && data.length > 0) {
        const backgrounds = data.map(item => ({
          page: item.key.replace('page_bg_', ''),
          background: item.value,
          description: item.description || `${item.key.replace('page_bg_', '').charAt(0).toUpperCase() + item.key.replace('page_bg_', '').slice(1)} page background`
        }))
        setPageBackgrounds(backgrounds)
      }
    } catch (error) {
      console.error('Error fetching page backgrounds:', error)
    } finally {
      setLoadingBackgrounds(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // Save page backgrounds
      for (const bg of pageBackgrounds) {
        await supabase
          .from('site_settings')
          .upsert({
            key: `page_bg_${bg.page}`,
            value: bg.background,
            description: bg.description,
            is_public: true
          }, { onConflict: 'key' })
      }
      
      // Theme updates are automatically saved in the context
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Theme settings saved successfully!')
    } catch (error) {
      console.error('Error saving theme settings:', error)
      alert('Error saving theme settings')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const themeData = exportTheme()
    const blob = new Blob([themeData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hopefoundation-theme-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const themeData = e.target?.result as string
          importTheme(themeData)
          alert('Theme imported successfully!')
        } catch (error) {
          alert('Error importing theme: Invalid file format')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addExcludedPage = () => {
    if (newExcludedPage.trim() && !maintenance.excludedPages.includes(newExcludedPage.trim())) {
      updateMaintenance({
        excludedPages: [...maintenance.excludedPages, newExcludedPage.trim()]
      })
      setNewExcludedPage('')
    }
  }

  const removeExcludedPage = (page: string) => {
    updateMaintenance({
      excludedPages: maintenance.excludedPages.filter(p => p !== page)
    })
  }

  const updatePageBackground = (page: string, color: string) => {
    setPageBackgrounds(prev => 
      prev.map(bg => bg.page === page ? { ...bg, background: color } : bg)
    )
  }

  const presetThemes = [
    {
      name: 'Ocean Blue',
      colors: {
        primary: '#0ea5e9',
        secondary: '#64748b',
        accent: '#06b6d4',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0284c7'
      }
    },
    {
      name: 'Forest Green',
      colors: {
        primary: '#059669',
        secondary: '#64748b',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f0fdf4',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#dcfce7',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0284c7'
      }
    },
    {
      name: 'Purple Dream',
      colors: {
        primary: '#7c3aed',
        secondary: '#64748b',
        accent: '#a855f7',
        background: '#ffffff',
        surface: '#faf5ff',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e9d5ff',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0284c7'
      }
    },
    {
      name: 'Dark Elegance',
      colors: {
        primary: '#3b82f6',
        secondary: '#94a3b8',
        accent: '#8b5cf6',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        border: '#334155',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4'
      }
    }
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Theme & Maintenance</h1>
            <p className="text-gray-600 mt-2">Customize the appearance and manage site maintenance</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button 
              onClick={handleImport}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button 
              onClick={resetTheme}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

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
        {activeTab === 'appearance' && (
          <div>
            {/* Theme Mode */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Theme Mode</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { mode: 'light', icon: Sun, label: 'Light Mode', desc: 'Clean and bright interface' },
                  { mode: 'dark', icon: Moon, label: 'Dark Mode', desc: 'Easy on the eyes' },
                  { mode: 'auto', icon: Monitor, label: 'Auto Mode', desc: 'Follows system preference' }
                ].map(({ mode, icon: Icon, label, desc }) => (
                  <button
                    key={mode}
                    onClick={() => updateTheme({ mode: mode as any })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      theme.mode === mode
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-8 w-8 mx-auto mb-3 ${
                      theme.mode === mode ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <h3 className="font-medium text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Color Palette</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(theme.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => updateTheme({
                          colors: { ...theme.colors, [key]: e.target.value }
                        })}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateTheme({
                            colors: { ...theme.colors, [key]: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(value)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preset Themes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preset Themes</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {presetThemes.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateTheme({ colors: preset.colors })}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                  >
                    <h3 className="font-medium text-gray-900 mb-3">{preset.name}</h3>
                    <div className="flex space-x-2">
                      {Object.values(preset.colors).slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Typography Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Inter, system-ui, sans-serif">Inter</option>
                    <option value="Roboto, system-ui, sans-serif">Roboto</option>
                    <option value="Open Sans, system-ui, sans-serif">Open Sans</option>
                    <option value="Lato, system-ui, sans-serif">Lato</option>
                    <option value="Poppins, system-ui, sans-serif">Poppins</option>
                    <option value="Montserrat, system-ui, sans-serif">Montserrat</option>
                    <option value="system-ui, sans-serif">System Default</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Font Size
                  </label>
                  <select
                    value={theme.fontSize}
                    onChange={(e) => updateTheme({ fontSize: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="small">Small (14px)</option>
                    <option value="medium">Medium (16px)</option>
                    <option value="large">Large (18px)</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Typography Preview</h3>
                <div className="space-y-4" style={{ fontFamily: theme.fontFamily }}>
                  <h1 className="text-3xl font-bold">Heading 1 - Main Title</h1>
                  <h2 className="text-2xl font-semibold">Heading 2 - Section Title</h2>
                  <h3 className="text-xl font-medium">Heading 3 - Subsection</h3>
                  <p className="text-base">
                    This is a paragraph of body text. It demonstrates how the selected font family 
                    and size will appear in regular content throughout the website.
                  </p>
                  <p className="text-sm text-gray-600">
                    This is smaller text, typically used for captions, metadata, or secondary information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Visual Effects</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Radius
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'none', label: 'None', preview: '0px' },
                      { value: 'small', label: 'Small', preview: '4px' },
                      { value: 'medium', label: 'Medium', preview: '8px' },
                      { value: 'large', label: 'Large', preview: '16px' }
                    ].map(({ value, label, preview }) => (
                      <button
                        key={value}
                        onClick={() => updateTheme({ borderRadius: value as any })}
                        className={`p-3 border-2 text-center transition-all ${
                          theme.borderRadius === value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ borderRadius: preview }}
                      >
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-xs text-gray-500">{preview}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Enable Animations</p>
                      <p className="text-sm text-gray-600">Smooth transitions and hover effects</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme.animations}
                      onChange={(e) => updateTheme({ animations: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Enable Shadows</p>
                      <p className="text-sm text-gray-600">Drop shadows for depth and elevation</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme.shadows}
                      onChange={(e) => updateTheme({ shadows: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Page Background Colors</h2>
                <button 
                  onClick={fetchPageBackgrounds}
                  className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </button>
              </div>
              
              {loadingBackgrounds ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Customize the background color for each page. These settings will override the global background color.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pageBackgrounds.map((bg) => (
                      <div key={bg.page} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-700 capitalize">
                            {bg.page} Page
                          </label>
                          <div 
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: bg.background }}
                          ></div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={bg.background}
                            onChange={(e) => updatePageBackground(bg.page, e.target.value)}
                            className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={bg.background}
                            onChange={(e) => updatePageBackground(bg.page, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            placeholder="#FFFFFF"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{bg.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Image className="h-5 w-5 text-blue-600 mt-0.5" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Background Images</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          For background images, use the Content Management section to upload and set image URLs.
                          Then reference them in your page backgrounds using CSS url() syntax.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview</h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  See how your page background colors will look on different pages.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pageBackgrounds.map((bg) => (
                    <div 
                      key={bg.page} 
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 border-b border-gray-200 capitalize">
                        {bg.page} Page
                      </div>
                      <div 
                        className="h-32 p-4 flex items-center justify-center"
                        style={{ backgroundColor: bg.background }}
                      >
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Background Color</div>
                          <div className="text-sm font-mono mt-1">{bg.background}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            {/* Maintenance Status */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Maintenance Mode</h2>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  maintenance.enabled 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {maintenance.enabled ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Disabled
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-800">Enable Maintenance Mode</p>
                      <p className="text-sm text-yellow-700">Temporarily disable public access to the site</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenance.enabled}
                      onChange={(e) => updateMaintenance({ enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Mode Type
                    </label>
                    <select
                      value={maintenance.mode}
                      onChange={(e) => updateMaintenance({ mode: e.target.value as 'full' | 'partial' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="full">Full Site Maintenance</option>
                      <option value="partial">Partial Site Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Completion Time
                    </label>
                    <input
                      type="text"
                      value={maintenance.estimatedTime}
                      onChange={(e) => updateMaintenance({ estimatedTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2 hours, 30 minutes"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Message
                  </label>
                  <textarea
                    value={maintenance.message}
                    onChange={(e) => updateMaintenance({ message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Message to display to users during maintenance"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowAdminAccess"
                    checked={maintenance.allowAdminAccess}
                    onChange={(e) => updateMaintenance({ allowAdminAccess: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowAdminAccess" className="ml-2 block text-sm text-gray-900">
                    Allow admin access during maintenance
                  </label>
                </div>
              </div>
            </div>

            {/* Excluded Pages */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Excluded Pages</h3>
              <p className="text-sm text-gray-600 mb-4">
                Pages that will remain accessible during maintenance mode
              </p>

              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newExcludedPage}
                    onChange={(e) => setNewExcludedPage(e.target.value)}
                    placeholder="/page-path"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addExcludedPage}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {maintenance.excludedPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-mono text-sm">{page}</span>
                      <button
                        onClick={() => removeExcludedPage(page)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {maintenance.excludedPages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No excluded pages configured
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}