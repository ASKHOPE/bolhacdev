import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  colors: ThemeColors
  borderRadius: 'none' | 'small' | 'medium' | 'large'
  fontSize: 'small' | 'medium' | 'large'
  fontFamily: string
  animations: boolean
  shadows: boolean
}

interface MaintenanceConfig {
  enabled: boolean
  mode: 'full' | 'partial'
  excludedPages: string[]
  message: string
  estimatedTime: string
  allowAdminAccess: boolean
}

interface ThemeContextType {
  theme: ThemeConfig
  maintenance: MaintenanceConfig
  updateTheme: (updates: Partial<ThemeConfig>) => void
  updateMaintenance: (updates: Partial<MaintenanceConfig>) => void
  resetTheme: () => void
  exportTheme: () => string
  importTheme: (themeData: string) => void
  isPageInMaintenance: (path: string) => boolean
}

const defaultLightColors: ThemeColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#7c3aed',
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

const defaultDarkColors: ThemeColors = {
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

const defaultTheme: ThemeConfig = {
  mode: 'light',
  colors: defaultLightColors,
  borderRadius: 'medium',
  fontSize: 'medium',
  fontFamily: 'Inter, system-ui, sans-serif',
  animations: true,
  shadows: true
}

const defaultMaintenance: MaintenanceConfig = {
  enabled: false,
  mode: 'full',
  excludedPages: ['/admin', '/login'],
  message: 'We are currently performing scheduled maintenance to improve your experience.',
  estimatedTime: '2 hours',
  allowAdminAccess: true
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme)
  const [maintenance, setMaintenance] = useState<MaintenanceConfig>(defaultMaintenance)

  useEffect(() => {
    loadThemeSettings()
    loadMaintenanceSettings()
    applySystemTheme()
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme.mode === 'auto') {
        applySystemTheme()
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    applyThemeToDOM()
  }, [theme])

  const loadThemeSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'theme_mode', 'theme_primary_color', 'theme_secondary_color', 'theme_accent_color',
          'theme_border_radius', 'theme_font_size', 'theme_font_family', 'theme_animations',
          'theme_shadows', 'theme_background', 'theme_surface', 'theme_text', 'theme_text_secondary',
          'theme_border', 'theme_success', 'theme_warning', 'theme_error', 'theme_info'
        ])

      if (error) throw error

      const settings = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>) || {}

      const loadedTheme: ThemeConfig = {
        mode: (settings.theme_mode as 'light' | 'dark' | 'auto') || defaultTheme.mode,
        colors: {
          primary: settings.theme_primary_color || defaultTheme.colors.primary,
          secondary: settings.theme_secondary_color || defaultTheme.colors.secondary,
          accent: settings.theme_accent_color || defaultTheme.colors.accent,
          background: settings.theme_background || defaultTheme.colors.background,
          surface: settings.theme_surface || defaultTheme.colors.surface,
          text: settings.theme_text || defaultTheme.colors.text,
          textSecondary: settings.theme_text_secondary || defaultTheme.colors.textSecondary,
          border: settings.theme_border || defaultTheme.colors.border,
          success: settings.theme_success || defaultTheme.colors.success,
          warning: settings.theme_warning || defaultTheme.colors.warning,
          error: settings.theme_error || defaultTheme.colors.error,
          info: settings.theme_info || defaultTheme.colors.info
        },
        borderRadius: (settings.theme_border_radius as any) || defaultTheme.borderRadius,
        fontSize: (settings.theme_font_size as any) || defaultTheme.fontSize,
        fontFamily: settings.theme_font_family || defaultTheme.fontFamily,
        animations: settings.theme_animations !== 'false',
        shadows: settings.theme_shadows !== 'false'
      }

      setTheme(loadedTheme)
    } catch (error) {
      console.error('Error loading theme settings:', error)
    }
  }

  const loadMaintenanceSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'maintenance_enabled', 'maintenance_mode', 'maintenance_excluded_pages',
          'maintenance_message', 'maintenance_estimated_time', 'maintenance_allow_admin'
        ])

      if (error) throw error

      const settings = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>) || {}

      const loadedMaintenance: MaintenanceConfig = {
        enabled: settings.maintenance_enabled === 'true',
        mode: (settings.maintenance_mode as 'full' | 'partial') || defaultMaintenance.mode,
        excludedPages: settings.maintenance_excluded_pages ? 
          JSON.parse(settings.maintenance_excluded_pages) : defaultMaintenance.excludedPages,
        message: settings.maintenance_message || defaultMaintenance.message,
        estimatedTime: settings.maintenance_estimated_time || defaultMaintenance.estimatedTime,
        allowAdminAccess: settings.maintenance_allow_admin !== 'false'
      }

      setMaintenance(loadedMaintenance)
    } catch (error) {
      console.error('Error loading maintenance settings:', error)
    }
  }

  const applySystemTheme = () => {
    if (theme.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const systemColors = prefersDark ? defaultDarkColors : defaultLightColors
      setTheme(prev => ({ ...prev, colors: { ...prev.colors, ...systemColors } }))
    }
  }

  const applyThemeToDOM = () => {
    const root = document.documentElement
    
    // Determine effective colors based on mode
    let effectiveColors = theme.colors
    if (theme.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const baseColors = prefersDark ? defaultDarkColors : defaultLightColors
      effectiveColors = { ...baseColors, ...theme.colors }
    } else if (theme.mode === 'dark') {
      effectiveColors = { ...defaultDarkColors, ...theme.colors }
    }
    
    // Apply CSS custom properties
    Object.entries(effectiveColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
    })

    // Apply other theme properties
    root.style.setProperty('--border-radius', getBorderRadiusValue(theme.borderRadius))
    root.style.setProperty('--font-size-base', getFontSizeValue(theme.fontSize))
    root.style.setProperty('--font-family', theme.fontFamily)
    
    // Apply theme class
    root.className = root.className.replace(/theme-\w+/g, '')
    
    // Determine effective theme mode for class
    let effectiveMode = theme.mode
    if (theme.mode === 'auto') {
      effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    
    root.classList.add(`theme-${effectiveMode}`)
    
    if (!theme.animations) root.classList.add('no-animations')
    else root.classList.remove('no-animations')
    
    if (!theme.shadows) root.classList.add('no-shadows')
    else root.classList.remove('no-shadows')
  }

  const getBorderRadiusValue = (radius: string) => {
    switch (radius) {
      case 'none': return '0px'
      case 'small': return '4px'
      case 'medium': return '8px'
      case 'large': return '16px'
      default: return '8px'
    }
  }

  const getFontSizeValue = (size: string) => {
    switch (size) {
      case 'small': return '14px'
      case 'medium': return '16px'
      case 'large': return '18px'
      default: return '16px'
    }
  }

  const updateTheme = async (updates: Partial<ThemeConfig>) => {
    const newTheme = { ...theme, ...updates }
    setTheme(newTheme)
    
    // Save to database
    try {
      const themeSettings = [
        { key: 'theme_mode', value: newTheme.mode },
        { key: 'theme_primary_color', value: newTheme.colors.primary },
        { key: 'theme_secondary_color', value: newTheme.colors.secondary },
        { key: 'theme_accent_color', value: newTheme.colors.accent },
        { key: 'theme_background', value: newTheme.colors.background },
        { key: 'theme_surface', value: newTheme.colors.surface },
        { key: 'theme_text', value: newTheme.colors.text },
        { key: 'theme_text_secondary', value: newTheme.colors.textSecondary },
        { key: 'theme_border', value: newTheme.colors.border },
        { key: 'theme_success', value: newTheme.colors.success },
        { key: 'theme_warning', value: newTheme.colors.warning },
        { key: 'theme_error', value: newTheme.colors.error },
        { key: 'theme_info', value: newTheme.colors.info },
        { key: 'theme_border_radius', value: newTheme.borderRadius },
        { key: 'theme_font_size', value: newTheme.fontSize },
        { key: 'theme_font_family', value: newTheme.fontFamily },
        { key: 'theme_animations', value: newTheme.animations.toString() },
        { key: 'theme_shadows', value: newTheme.shadows.toString() }
      ]

      for (const setting of themeSettings) {
        await supabase
          .from('site_settings')
          .upsert({ ...setting, description: `Theme ${setting.key}`, is_public: false }, { onConflict: 'key' })
      }
    } catch (error) {
      console.error('Error saving theme settings:', error)
    }
  }

  const updateMaintenance = async (updates: Partial<MaintenanceConfig>) => {
    const newMaintenance = { ...maintenance, ...updates }
    setMaintenance(newMaintenance)
    
    // Save to database
    try {
      const maintenanceSettings = [
        { key: 'maintenance_enabled', value: newMaintenance.enabled.toString() },
        { key: 'maintenance_mode', value: newMaintenance.mode },
        { key: 'maintenance_excluded_pages', value: JSON.stringify(newMaintenance.excludedPages) },
        { key: 'maintenance_message', value: newMaintenance.message },
        { key: 'maintenance_estimated_time', value: newMaintenance.estimatedTime },
        { key: 'maintenance_allow_admin', value: newMaintenance.allowAdminAccess.toString() }
      ]

      for (const setting of maintenanceSettings) {
        await supabase
          .from('site_settings')
          .upsert({ ...setting, description: `Maintenance ${setting.key}`, is_public: false }, { onConflict: 'key' })
      }
    } catch (error) {
      console.error('Error saving maintenance settings:', error)
    }
  }

  const resetTheme = () => {
    setTheme(defaultTheme)
    updateTheme(defaultTheme)
  }

  const exportTheme = () => {
    return JSON.stringify({ theme, maintenance }, null, 2)
  }

  const importTheme = (themeData: string) => {
    try {
      const imported = JSON.parse(themeData)
      if (imported.theme) updateTheme(imported.theme)
      if (imported.maintenance) updateMaintenance(imported.maintenance)
    } catch (error) {
      console.error('Error importing theme:', error)
      throw new Error('Invalid theme data')
    }
  }

  const isPageInMaintenance = (path: string) => {
    if (!maintenance.enabled) return false
    if (maintenance.mode === 'full') {
      return !maintenance.excludedPages.some(excluded => path.startsWith(excluded))
    }
    return false // For partial mode, implement specific page logic
  }

  const value = {
    theme,
    maintenance,
    updateTheme,
    updateMaintenance,
    resetTheme,
    exportTheme,
    importTheme,
    isPageInMaintenance
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}