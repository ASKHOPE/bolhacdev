import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface SiteSettings {
  site_name: string
  site_description: string
  logo_url: string
  contact_email: string
  contact_phone: string
  contact_address: string
  facebook_url: string
  twitter_url: string
  instagram_url: string
  linkedin_url: string
  youtube_url: string
  primary_color: string
  secondary_color: string
  [key: string]: string
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'HopeFoundation',
    site_description: 'Creating positive change in communities worldwide',
    logo_url: '',
    contact_email: 'info@hopefoundation.org',
    contact_phone: '+1 (555) 123-4567',
    contact_address: '123 Hope Street, City, State 12345',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    primary_color: '#2563eb',
    secondary_color: '#64748b'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('is_public', true)

      if (error) throw error

      const settingsMap = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>) || {}

      setSettings(prev => ({ ...prev, ...settingsMap }))
    } catch (error) {
      console.error('Error fetching site settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue
  }

  return {
    settings,
    loading,
    getSetting,
    refetch: fetchSettings
  }
}