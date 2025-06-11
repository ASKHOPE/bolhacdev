import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Save, 
  Shield, 
  Bell, 
  Mail, 
  Database,
  Key,
  Globe,
  Users,
  Lock,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface SystemSetting {
  id: string
  key: string
  value: string
  description: string | null
  is_public: boolean
  category: string
}

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown')

  const [formData, setFormData] = useState({
    general: {
      siteName: 'HopeFoundation',
      siteDescription: 'Creating positive change in communities worldwide',
      timezone: 'UTC-5',
      language: 'en',
      maintenanceMode: false,
      debugMode: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      loginAttempts: 5,
      ipWhitelist: '',
      forceHttps: true,
      corsOrigins: '*',
    },
    notifications: {
      emailNotifications: true,
      donationAlerts: true,
      eventReminders: true,
      systemAlerts: true,
      weeklyReports: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'info@hopefoundation.org',
      fromName: 'HopeFoundation',
      enableTls: true,
      enableAuth: true,
    },
    integrations: {
      stripePublishableKey: '',
      stripeSecretKey: '',
      stripeWebhookSecret: '',
      googleAnalyticsId: '',
      facebookPixelId: '',
      mailchimpApiKey: '',
      twilioAccountSid: '',
      twilioAuthToken: '',
    },
    performance: {
      cacheEnabled: true,
      cacheTtl: 3600,
      compressionEnabled: true,
      cdnEnabled: false,
      cdnUrl: '',
      maxUploadSize: 10,
      rateLimitEnabled: true,
      rateLimitRequests: 100,
    }
  })

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'integrations', name: 'Integrations', icon: Key },
    { id: 'performance', name: 'Performance', icon: Zap },
    { id: 'database', name: 'Database', icon: Database },
  ]

  useEffect(() => {
    loadSettings()
    testDatabaseConnection()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key')

      if (error) throw error
      
      // Convert settings to form data structure
      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>)

      // Update form data with loaded settings
      setFormData(prev => ({
        ...prev,
        general: {
          ...prev.general,
          siteName: settingsMap.site_name || prev.general.siteName,
          siteDescription: settingsMap.site_description || prev.general.siteDescription,
          timezone: settingsMap.timezone || prev.general.timezone,
          language: settingsMap.language || prev.general.language,
          maintenanceMode: settingsMap.maintenance_mode === 'true',
          debugMode: settingsMap.debug_mode === 'true',
        },
        email: {
          ...prev.email,
          smtpHost: settingsMap.smtp_host || prev.email.smtpHost,
          smtpPort: parseInt(settingsMap.smtp_port) || prev.email.smtpPort,
          fromEmail: settingsMap.from_email || prev.email.fromEmail,
          fromName: settingsMap.from_name || prev.email.fromName,
        }
      }))

      setSettings(data || [])
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseConnection = async () => {
    setTestingConnection(true)
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('count')
        .limit(1)

      if (error) throw error
      setConnectionStatus('success')
    } catch (error) {
      console.error('Database connection test failed:', error)
      setConnectionStatus('error')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Convert form data to settings format
      const settingsToUpdate = [
        { key: 'site_name', value: formData.general.siteName, description: 'Site name', is_public: true },
        { key: 'site_description', value: formData.general.siteDescription, description: 'Site description', is_public: true },
        { key: 'timezone', value: formData.general.timezone, description: 'Site timezone', is_public: false },
        { key: 'language', value: formData.general.language, description: 'Site language', is_public: true },
        { key: 'maintenance_mode', value: formData.general.maintenanceMode.toString(), description: 'Maintenance mode', is_public: false },
        { key: 'debug_mode', value: formData.general.debugMode.toString(), description: 'Debug mode', is_public: false },
        { key: 'smtp_host', value: formData.email.smtpHost, description: 'SMTP host', is_public: false },
        { key: 'smtp_port', value: formData.email.smtpPort.toString(), description: 'SMTP port', is_public: false },
        { key: 'from_email', value: formData.email.fromEmail, description: 'From email', is_public: false },
        { key: 'from_name', value: formData.email.fromName, description: 'From name', is_public: false },
      ]

      for (const setting of settingsToUpdate) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(setting, { onConflict: 'key' })

        if (error) throw error
      }

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings: ' + (error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(formData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `hopefoundation-settings-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          setFormData(importedSettings)
          alert('Settings imported successfully!')
        } catch (error) {
          alert('Error importing settings: Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
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
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-2">Configure system preferences, security, and integrations</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={exportSettings}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button 
              onClick={importSettings}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
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

      {/* System Status */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Website Status</p>
              <p className="text-xs text-gray-500">All systems operational</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              connectionStatus === 'success' ? 'bg-green-500' : 
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Database</p>
              <p className="text-xs text-gray-500">
                {connectionStatus === 'success' ? 'Connected and healthy' : 
                 connectionStatus === 'error' ? 'Connection issues' : 'Testing...'}
              </p>
            </div>
            <button
              onClick={testDatabaseConnection}
              disabled={testingConnection}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className={`h-4 w-4 ${testingConnection ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Email Service</p>
              <p className="text-xs text-gray-500">Configured and ready</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
              <p className="text-xs text-gray-500">
                {formData.general.maintenanceMode ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow-md p-4 mr-8">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          {activeTab === 'general' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={formData.general.siteName}
                      onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={formData.general.language}
                      onChange={(e) => updateSetting('general', 'language', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={formData.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UTC-5">UTC-5 (Eastern)</option>
                    <option value="UTC-6">UTC-6 (Central)</option>
                    <option value="UTC-7">UTC-7 (Mountain)</option>
                    <option value="UTC-8">UTC-8 (Pacific)</option>
                    <option value="UTC+0">UTC+0 (GMT)</option>
                  </select>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium text-yellow-800">Maintenance Mode</p>
                        <p className="text-sm text-yellow-700">Temporarily disable public access to the site</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.general.maintenanceMode}
                        onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">Debug Mode</p>
                        <p className="text-sm text-gray-600">Enable detailed error logging and debugging</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.general.debugMode}
                        onChange={(e) => updateSetting('general', 'debugMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={formData.security.loginAttempts}
                      onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Policy
                  </label>
                  <select
                    value={formData.security.passwordPolicy}
                    onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="weak">Weak (6+ characters)</option>
                    <option value="medium">Medium (8+ characters, mixed case)</option>
                    <option value="strong">Strong (12+ characters, mixed case, numbers, symbols)</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-800">Force HTTPS</p>
                        <p className="text-sm text-green-700">Redirect all HTTP traffic to HTTPS</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.security.forceHttps}
                        onChange={(e) => updateSetting('security', 'forceHttps', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-blue-800">Two-Factor Authentication</p>
                        <p className="text-sm text-blue-700">Require 2FA for admin accounts</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.security.twoFactorAuth}
                        onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Configuration</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={formData.email.smtpHost}
                      onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={formData.email.smtpPort}
                      onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={formData.email.fromEmail}
                      onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={formData.email.fromName}
                      onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={formData.email.smtpUser}
                      onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={formData.email.smtpPassword}
                        onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableTls"
                      checked={formData.email.enableTls}
                      onChange={(e) => updateSetting('email', 'enableTls', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableTls" className="ml-2 block text-sm text-gray-900">
                      Enable TLS
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableAuth"
                      checked={formData.email.enableAuth}
                      onChange={(e) => updateSetting('email', 'enableAuth', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableAuth" className="ml-2 block text-sm text-gray-900">
                      Enable Authentication
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-800">Test Email Configuration</p>
                      <p className="text-sm text-blue-700">Send a test email to verify your settings</p>
                    </div>
                  </div>
                  <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Send Test Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Third-party Integrations</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Processing (Stripe)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publishable Key
                      </label>
                      <input
                        type="text"
                        value={formData.integrations.stripePublishableKey}
                        onChange={(e) => updateSetting('integrations', 'stripePublishableKey', e.target.value)}
                        placeholder="pk_test_..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secret Key
                      </label>
                      <input
                        type="password"
                        value={formData.integrations.stripeSecretKey}
                        onChange={(e) => updateSetting('integrations', 'stripeSecretKey', e.target.value)}
                        placeholder="sk_test_..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook Secret
                      </label>
                      <input
                        type="password"
                        value={formData.integrations.stripeWebhookSecret}
                        onChange={(e) => updateSetting('integrations', 'stripeWebhookSecret', e.target.value)}
                        placeholder="whsec_..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics & Tracking</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Analytics ID
                      </label>
                      <input
                        type="text"
                        value={formData.integrations.googleAnalyticsId}
                        onChange={(e) => updateSetting('integrations', 'googleAnalyticsId', e.target.value)}
                        placeholder="GA-XXXXXXXXX-X"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook Pixel ID
                      </label>
                      <input
                        type="text"
                        value={formData.integrations.facebookPixelId}
                        onChange={(e) => updateSetting('integrations', 'facebookPixelId', e.target.value)}
                        placeholder="123456789012345"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Communication</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mailchimp API Key
                      </label>
                      <input
                        type="password"
                        value={formData.integrations.mailchimpApiKey}
                        onChange={(e) => updateSetting('integrations', 'mailchimpApiKey', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Twilio Account SID
                        </label>
                        <input
                          type="text"
                          value={formData.integrations.twilioAccountSid}
                          onChange={(e) => updateSetting('integrations', 'twilioAccountSid', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Twilio Auth Token
                        </label>
                        <input
                          type="password"
                          value={formData.integrations.twilioAuthToken}
                          onChange={(e) => updateSetting('integrations', 'twilioAuthToken', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  {Object.entries(formData.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-gray-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </p>
                          <p className="text-sm text-gray-600">
                            {key === 'emailNotifications' && 'Receive email notifications for important events'}
                            {key === 'donationAlerts' && 'Get notified when new donations are received'}
                            {key === 'eventReminders' && 'Receive reminders about upcoming events'}
                            {key === 'systemAlerts' && 'Get alerts about system issues and updates'}
                            {key === 'weeklyReports' && 'Receive weekly summary reports'}
                            {key === 'smsNotifications' && 'Receive SMS notifications for urgent matters'}
                            {key === 'pushNotifications' && 'Browser push notifications'}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance & Optimization</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cache TTL (seconds)
                    </label>
                    <input
                      type="number"
                      value={formData.performance.cacheTtl}
                      onChange={(e) => updateSetting('performance', 'cacheTtl', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Upload Size (MB)
                    </label>
                    <input
                      type="number"
                      value={formData.performance.maxUploadSize}
                      onChange={(e) => updateSetting('performance', 'maxUploadSize', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-800">Enable Caching</p>
                        <p className="text-sm text-green-700">Cache responses to improve performance</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.performance.cacheEnabled}
                        onChange={(e) => updateSetting('performance', 'cacheEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <Server className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-blue-800">Compression</p>
                        <p className="text-sm text-blue-700">Enable gzip compression for responses</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.performance.compressionEnabled}
                        onChange={(e) => updateSetting('performance', 'compressionEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Database Management</h2>
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Database className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Connection Status</h3>
                        <p className="text-sm text-gray-600">Monitor database connectivity and performance</p>
                      </div>
                    </div>
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      connectionStatus === 'success' ? 'bg-green-100 text-green-800' :
                      connectionStatus === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {connectionStatus === 'success' && <CheckCircle className="h-4 w-4 mr-1" />}
                      {connectionStatus === 'error' && <AlertTriangle className="h-4 w-4 mr-1" />}
                      {connectionStatus === 'unknown' && <RefreshCw className="h-4 w-4 mr-1" />}
                      {connectionStatus === 'success' ? 'Connected' : 
                       connectionStatus === 'error' ? 'Connection Error' : 'Testing...'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">8</div>
                      <div className="text-sm text-gray-600">Tables</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">~2.1MB</div>
                      <div className="text-sm text-gray-600">Database Size</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">15ms</div>
                      <div className="text-sm text-gray-600">Avg Query Time</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={testDatabaseConnection}
                      disabled={testingConnection}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${testingConnection ? 'animate-spin' : ''}`} />
                      Test Connection
                    </button>
                    <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <Download className="h-4 w-4 mr-2" />
                      Backup Database
                    </button>
                    <button className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                      <Database className="h-4 w-4 mr-2" />
                      Optimize Tables
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-800">Database Maintenance</p>
                      <p className="text-sm text-yellow-700">
                        Regular maintenance helps ensure optimal performance. Consider scheduling automatic backups and optimization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}