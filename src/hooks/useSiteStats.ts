import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface SiteStat {
  id: string
  key: string
  label: string
  value: string
  icon: string
  page: string
  display_order: number
  is_active: boolean
}

interface ResponseTime {
  id: string
  inquiry_type: string
  response_time: string
  display_order: number
  is_active: boolean
}

export function useSiteStats() {
  const [stats, setStats] = useState<SiteStat[]>([])
  const [responseTimes, setResponseTimes] = useState<ResponseTime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsResult, responseTimesResult] = await Promise.all([
        supabase
          .from('site_stats')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
        supabase
          .from('response_times')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
      ])

      if (statsResult.error) throw statsResult.error
      if (responseTimesResult.error) throw responseTimesResult.error

      setStats(statsResult.data || [])
      setResponseTimes(responseTimesResult.data || [])
    } catch (error) {
      console.error('Error fetching stats and response times:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatsByPage = (page: string) => {
    return stats.filter(stat => stat.page === page)
  }

  return {
    stats,
    responseTimes,
    loading,
    getStatsByPage,
    refetch: fetchData
  }
}