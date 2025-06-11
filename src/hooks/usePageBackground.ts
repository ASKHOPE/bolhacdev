import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function usePageBackground() {
  const location = useLocation()
  const [background, setBackground] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPageBackground()
  }, [location.pathname])

  const fetchPageBackground = async () => {
    try {
      // Extract the page name from the path
      let pageName = location.pathname.split('/')[1] || 'home'
      
      // Handle nested routes
      if (pageName.includes('/')) {
        pageName = pageName.split('/')[0]
      }
      
      // If it's a nested route like /programs/education, use the parent
      if (!pageName) pageName = 'home'
      
      console.log('Fetching background for page:', pageName)
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', `page_bg_${pageName}`)
        .single()

      if (error) {
        // Only log errors that are not 'PGRST116' (no rows returned)
        // PGRST116 is expected when a page background setting doesn't exist
        if (error.code !== 'PGRST116') {
          console.error('Error fetching page background:', error)
        }
        setBackground(null)
      } else if (data) {
        console.log('Found background:', data.value)
        setBackground(data.value)
      } else {
        // Fallback to default background
        console.log('No background found, using default')
        setBackground(null)
      }
    } catch (error) {
      console.error('Error in usePageBackground:', error)
      setBackground(null)
    } finally {
      setLoading(false)
    }
  }

  return { background, loading }
}