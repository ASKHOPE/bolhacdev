import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalEvents: 0,
    totalSubscribers: 0,
    monthlyDonations: [],
    userGrowth: [],
    eventAttendance: [],
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch basic counts
      const [usersResult, donationsResult, eventsResult, subscribersResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('donations').select('*'),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
      ])

      const totalDonationAmount = donationsResult.data?.reduce((sum, d) => sum + d.amount, 0) || 0

      setAnalytics({
        totalUsers: usersResult.count || 0,
        totalDonations: totalDonationAmount,
        totalEvents: eventsResult.count || 0,
        totalSubscribers: subscribersResult.count || 0,
        monthlyDonations: generateMockMonthlyData(),
        userGrowth: generateMockGrowthData(),
        eventAttendance: generateMockEventData(),
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data generators for demonstration
  const generateMockMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => ({
      month,
      amount: Math.floor(Math.random() * 10000) + 5000
    }))
  }

  const generateMockGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => ({
      month,
      users: Math.floor(Math.random() * 100) + 50
    }))
  }

  const generateMockEventData = () => {
    return [
      { name: 'Charity Gala', attendees: 180, capacity: 200 },
      { name: 'Health Fair', attendees: 450, capacity: 500 },
      { name: 'Training Workshop', attendees: 35, capacity: 50 },
      { name: 'Water Project Launch', attendees: 85, capacity: 100 },
    ]
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
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track performance and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchAnalytics}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.totalDonations.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalEvents}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Eye className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Newsletter Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalSubscribers}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% from last month
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Donations Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Donations</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.monthlyDonations.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-500 w-full rounded-t"
                  style={{ height: `${(data.amount / 15000) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                <span className="text-xs text-gray-500">${(data.amount / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.userGrowth.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-green-500 w-full rounded-t"
                  style={{ height: `${(data.users / 150) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                <span className="text-xs text-gray-500">{data.users}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Attendance */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Attendance</h3>
        <div className="space-y-4">
          {analytics.eventAttendance.map((event, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{event.name}</span>
                  <span className="text-sm text-gray-600">{event.attendees}/{event.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New donation received</p>
              <p className="text-xs text-gray-500">$250 from John Doe - 2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New user registered</p>
              <p className="text-xs text-gray-500">jane.smith@email.com - 15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Event registration</p>
              <p className="text-xs text-gray-500">Community Health Fair - 1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}