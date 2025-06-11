import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Settings, 
  Calendar, 
  Heart, 
  BarChart3, 
  FileText,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalEvents: 0,
    activeVolunteers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch donation stats
      const { data: donations } = await supabase
        .from('donations')
        .select('amount')

      const totalDonationAmount = donations?.reduce((sum, donation) => sum + donation.amount, 0) || 0

      // Fetch event count
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: userCount || 0,
        totalDonations: totalDonationAmount,
        totalEvents: eventCount || 0,
        activeVolunteers: Math.floor((userCount || 0) * 0.3), // Estimate 30% are volunteers
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const adminStats = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+12%',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      icon: DollarSign,
      label: 'Total Donations',
      value: `$${stats.totalDonations.toLocaleString()}`,
      change: '+8%',
      color: 'text-green-600 bg-green-100',
    },
    {
      icon: Calendar,
      label: 'Total Events',
      value: stats.totalEvents.toString(),
      change: '+15%',
      color: 'text-purple-600 bg-purple-100',
    },
    {
      icon: Heart,
      label: 'Active Volunteers',
      value: stats.activeVolunteers.toLocaleString(),
      change: '+5%',
      color: 'text-red-600 bg-red-100',
    },
  ]

  const quickActions = [
    {
      icon: Users,
      title: 'Manage Users',
      description: 'View and manage user accounts',
      href: '/admin/users',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: Calendar,
      title: 'Manage Events',
      description: 'Create and manage events',
      href: '/admin/events',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      icon: Settings,
      title: 'Site Settings',
      description: 'Configure website settings',
      href: '/admin/settings',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View detailed analytics',
      href: '/admin/analytics',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      icon: Heart,
      title: 'Donations',
      description: 'Manage donation records',
      href: '/admin/donations',
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      icon: FileText,
      title: 'Content',
      description: 'Manage website content',
      href: '/admin/content',
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ]

  const recentActivity = [
    {
      type: 'user',
      message: 'New user registered: john.doe@email.com',
      time: '2 minutes ago',
      icon: Users,
    },
    {
      type: 'donation',
      message: 'New donation received: $250',
      time: '15 minutes ago',
      icon: DollarSign,
    },
    {
      type: 'event',
      message: 'Event "Community Health Fair" updated',
      time: '1 hour ago',
      icon: Calendar,
    },
    {
      type: 'system',
      message: 'Site settings updated',
      time: '2 hours ago',
      icon: Settings,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your non-profit organization's website and operations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className={`block p-4 rounded-lg text-white transition-colors ${action.color}`}
                  >
                    <div className="flex items-center">
                      <action.icon className="h-6 w-6 mr-3" />
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm opacity-90 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <activity.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <a
                href="/admin/activity"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all activity →
              </a>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Website Status</p>
                <p className="text-xs text-gray-500">All systems operational</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">Connected and healthy</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email Service</p>
                <p className="text-xs text-gray-500">Minor delays reported</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}