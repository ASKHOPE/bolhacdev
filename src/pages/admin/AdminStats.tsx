import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Users,
  Heart,
  Globe,
  Award,
  Calendar,
  Target,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

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

const iconOptions = [
  { value: 'Users', label: 'Users', icon: Users },
  { value: 'Heart', label: 'Heart', icon: Heart },
  { value: 'Globe', label: 'Globe', icon: Globe },
  { value: 'Award', label: 'Award', icon: Award },
  { value: 'Calendar', label: 'Calendar', icon: Calendar },
  { value: 'Target', label: 'Target', icon: Target },
]

const pageOptions = [
  { value: 'home', label: 'Home Page' },
  { value: 'about', label: 'About Page' },
  { value: 'programs', label: 'Programs Page' },
  { value: 'events', label: 'Events Page' },
  { value: 'donate', label: 'Donate Page' },
  { value: 'contact', label: 'Contact Page' },
]

export function AdminStats() {
  const [stats, setStats] = useState<SiteStat[]>([])
  const [responseTimes, setResponseTimes] = useState<ResponseTime[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStat, setEditingStat] = useState<SiteStat | null>(null)
  const [editingResponseTime, setEditingResponseTime] = useState<ResponseTime | null>(null)
  const [showAddStat, setShowAddStat] = useState(false)
  const [showAddResponseTime, setShowAddResponseTime] = useState(false)
  const [activeTab, setActiveTab] = useState('stats')

  const [newStat, setNewStat] = useState({
    key: '',
    label: '',
    value: '',
    icon: 'Users',
    page: 'home',
    display_order: 0,
    is_active: true
  })

  const [newResponseTime, setNewResponseTime] = useState({
    inquiry_type: '',
    response_time: '',
    display_order: 0,
    is_active: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsResult, responseTimesResult] = await Promise.all([
        supabase.from('site_stats').select('*').order('page').order('display_order'),
        supabase.from('response_times').select('*').order('display_order')
      ])

      if (statsResult.error) throw statsResult.error
      if (responseTimesResult.error) throw responseTimesResult.error

      setStats(statsResult.data || [])
      setResponseTimes(responseTimesResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addStat = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('site_stats')
        .insert([newStat])
        .select()
        .single()

      if (error) throw error

      setStats([...stats, data])
      setNewStat({
        key: '',
        label: '',
        value: '',
        icon: 'Users',
        page: 'home',
        display_order: 0,
        is_active: true
      })
      setShowAddStat(false)
    } catch (error) {
      console.error('Error adding stat:', error)
      alert('Error adding stat: ' + (error as Error).message)
    }
  }

  const updateStat = async (stat: SiteStat) => {
    try {
      const { error } = await supabase
        .from('site_stats')
        .update(stat)
        .eq('id', stat.id)

      if (error) throw error

      setStats(stats.map(s => s.id === stat.id ? stat : s))
      setEditingStat(null)
    } catch (error) {
      console.error('Error updating stat:', error)
      alert('Error updating stat: ' + (error as Error).message)
    }
  }

  const deleteStat = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stat?')) return

    try {
      const { error } = await supabase
        .from('site_stats')
        .delete()
        .eq('id', id)

      if (error) throw error

      setStats(stats.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error deleting stat:', error)
      alert('Error deleting stat: ' + (error as Error).message)
    }
  }

  const addResponseTime = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('response_times')
        .insert([newResponseTime])
        .select()
        .single()

      if (error) throw error

      setResponseTimes([...responseTimes, data])
      setNewResponseTime({
        inquiry_type: '',
        response_time: '',
        display_order: 0,
        is_active: true
      })
      setShowAddResponseTime(false)
    } catch (error) {
      console.error('Error adding response time:', error)
      alert('Error adding response time: ' + (error as Error).message)
    }
  }

  const updateResponseTime = async (responseTime: ResponseTime) => {
    try {
      const { error } = await supabase
        .from('response_times')
        .update(responseTime)
        .eq('id', responseTime.id)

      if (error) throw error

      setResponseTimes(responseTimes.map(rt => rt.id === responseTime.id ? responseTime : rt))
      setEditingResponseTime(null)
    } catch (error) {
      console.error('Error updating response time:', error)
      alert('Error updating response time: ' + (error as Error).message)
    }
  }

  const deleteResponseTime = async (id: string) => {
    if (!confirm('Are you sure you want to delete this response time?')) return

    try {
      const { error } = await supabase
        .from('response_times')
        .delete()
        .eq('id', id)

      if (error) throw error

      setResponseTimes(responseTimes.filter(rt => rt.id !== id))
    } catch (error) {
      console.error('Error deleting response time:', error)
      alert('Error deleting response time: ' + (error as Error).message)
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName)
    return iconOption ? iconOption.icon : Users
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
            <h1 className="text-3xl font-bold text-gray-900">Stats Management</h1>
            <p className="text-gray-600 mt-2">Manage site statistics and response times</p>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2 inline" />
              Site Statistics
            </button>
            <button
              onClick={() => setActiveTab('response-times')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'response-times'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="h-4 w-4 mr-2 inline" />
              Response Times
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'stats' && (
        <div>
          {/* Add Stat Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddStat(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Statistic
            </button>
          </div>

          {/* Stats by Page */}
          {pageOptions.map(page => {
            const pageStats = stats.filter(s => s.page === page.value)
            if (pageStats.length === 0) return null

            return (
              <div key={page.value} className="mb-8 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{page.label}</h2>
                <div className="space-y-4">
                  {pageStats.map(stat => {
                    const IconComponent = getIconComponent(stat.icon)
                    return (
                      <div key={stat.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{stat.label}</h3>
                            <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                            <p className="text-sm text-gray-500">Key: {stat.key}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateStat({ ...stat, is_active: !stat.is_active })}
                            className={`p-2 rounded ${stat.is_active ? 'text-green-600' : 'text-gray-400'}`}
                            title={stat.is_active ? 'Active' : 'Inactive'}
                          >
                            {stat.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setEditingStat(stat)}
                            className="p-2 text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteStat(stat.id)}
                            className="p-2 text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Add Stat Modal */}
          {showAddStat && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Add New Statistic</h2>
                  <button onClick={() => setShowAddStat(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={addStat} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                    <input
                      type="text"
                      required
                      value={newStat.key}
                      onChange={(e) => setNewStat({...newStat, key: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="unique_key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      required
                      value={newStat.label}
                      onChange={(e) => setNewStat({...newStat, label: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Display Label"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input
                      type="text"
                      required
                      value={newStat.value}
                      onChange={(e) => setNewStat({...newStat, value: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="50,000+"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                    <select
                      value={newStat.icon}
                      onChange={(e) => setNewStat({...newStat, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
                    <select
                      value={newStat.page}
                      onChange={(e) => setNewStat({...newStat, page: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {pageOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={newStat.display_order}
                      onChange={(e) => setNewStat({...newStat, display_order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Statistic
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddStat(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Stat Modal */}
          {editingStat && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Edit Statistic</h2>
                  <button onClick={() => setEditingStat(null)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  updateStat(editingStat)
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                    <input
                      type="text"
                      required
                      value={editingStat.key}
                      onChange={(e) => setEditingStat({...editingStat, key: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      required
                      value={editingStat.label}
                      onChange={(e) => setEditingStat({...editingStat, label: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input
                      type="text"
                      required
                      value={editingStat.value}
                      onChange={(e) => setEditingStat({...editingStat, value: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                    <select
                      value={editingStat.icon}
                      onChange={(e) => setEditingStat({...editingStat, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
                    <select
                      value={editingStat.page}
                      onChange={(e) => setEditingStat({...editingStat, page: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {pageOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={editingStat.display_order}
                      onChange={(e) => setEditingStat({...editingStat, display_order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={editingStat.is_active}
                      onChange={(e) => setEditingStat({...editingStat, is_active: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2 inline" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStat(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'response-times' && (
        <div>
          {/* Add Response Time Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddResponseTime(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Response Time
            </button>
          </div>

          {/* Response Times List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Page Response Times</h2>
            <div className="space-y-4">
              {responseTimes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No response times configured yet. Add your first one!
                </div>
              ) : (
                responseTimes.map(responseTime => (
                  <div key={responseTime.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{responseTime.inquiry_type}</h3>
                      <p className="text-blue-600 font-medium">{responseTime.response_time}</p>
                      <p className="text-sm text-gray-500">Display order: {responseTime.display_order}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateResponseTime({ ...responseTime, is_active: !responseTime.is_active })}
                        className={`p-2 rounded ${responseTime.is_active ? 'text-green-600' : 'text-gray-400'}`}
                        title={responseTime.is_active ? 'Active' : 'Inactive'}
                      >
                        {responseTime.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setEditingResponseTime(responseTime)}
                        className="p-2 text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteResponseTime(responseTime.id)}
                        className="p-2 text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Response Time Modal */}
          {showAddResponseTime && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Add New Response Time</h2>
                  <button onClick={() => setShowAddResponseTime(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={addResponseTime} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inquiry Type</label>
                    <input
                      type="text"
                      required
                      value={newResponseTime.inquiry_type}
                      onChange={(e) => setNewResponseTime({...newResponseTime, inquiry_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="General Inquiries"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                    <input
                      type="text"
                      required
                      value={newResponseTime.response_time}
                      onChange={(e) => setNewResponseTime({...newResponseTime, response_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Within 24 hours"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={newResponseTime.display_order}
                      onChange={(e) => setNewResponseTime({...newResponseTime, display_order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Response Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddResponseTime(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Response Time Modal */}
          {editingResponseTime && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Edit Response Time</h2>
                  <button onClick={() => setEditingResponseTime(null)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  updateResponseTime(editingResponseTime)
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inquiry Type</label>
                    <input
                      type="text"
                      required
                      value={editingResponseTime.inquiry_type}
                      onChange={(e) => setEditingResponseTime({...editingResponseTime, inquiry_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                    <input
                      type="text"
                      required
                      value={editingResponseTime.response_time}
                      onChange={(e) => setEditingResponseTime({...editingResponseTime, response_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={editingResponseTime.display_order}
                      onChange={(e) => setEditingResponseTime({...editingResponseTime, display_order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rt_is_active"
                      checked={editingResponseTime.is_active}
                      onChange={(e) => setEditingResponseTime({...editingResponseTime, is_active: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="rt_is_active" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2 inline" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingResponseTime(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}