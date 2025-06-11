import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Heart, Calendar, Settings, Award, Users } from 'lucide-react'

export function Dashboard() {
  const { profile } = useAuth()

  const userStats = [
    { icon: Heart, label: 'Donations Made', value: '3', color: 'text-red-600 bg-red-100' },
    { icon: Calendar, label: 'Events Attended', value: '7', color: 'text-blue-600 bg-blue-100' },
    { icon: Users, label: 'Volunteer Hours', value: '24', color: 'text-green-600 bg-green-100' },
    { icon: Award, label: 'Impact Score', value: '85', color: 'text-purple-600 bg-purple-100' },
  ]

  const recentActivity = [
    {
      type: 'donation',
      title: 'Donated to Education Initiative',
      description: 'Contributed $50 to help build schools in rural areas',
      date: '2 days ago',
      icon: Heart,
      color: 'text-red-600',
    },
    {
      type: 'event',
      title: 'Attended Community Health Fair',
      description: 'Volunteered at the health screening event',
      date: '1 week ago',
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      type: 'volunteer',
      title: 'Completed Volunteer Training',
      description: 'Finished the comprehensive volunteer orientation program',
      date: '2 weeks ago',
      icon: Users,
      color: 'text-green-600',
    },
  ]

  const upcomingEvents = [
    {
      title: 'Annual Charity Gala',
      date: 'March 15, 2025',
      location: 'Grand Ballroom',
      registered: true,
    },
    {
      title: 'Volunteer Training Workshop',
      date: 'February 20, 2025',
      location: 'Training Center',
      registered: false,
    },
    {
      title: 'Clean Water Project Launch',
      date: 'April 10, 2025',
      location: 'Project Site',
      registered: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your impact dashboard and recent activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {activity.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.date} • {event.location}
                      </p>
                    </div>
                    <div>
                      {event.registered ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Registered
                        </span>
                      ) : (
                        <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            <button className="flex items-center text-blue-600 hover:text-blue-700">
              <Settings className="h-4 w-4 mr-1" />
              Edit Profile
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <p className="text-gray-900">{profile?.full_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-gray-900">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                profile?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {profile?.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <p className="text-gray-900">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Heart className="h-5 w-5 mr-2" />
              Make a Donation
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Users className="h-5 w-5 mr-2" />
              Volunteer Now
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Calendar className="h-5 w-5 mr-2" />
              View Events
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}