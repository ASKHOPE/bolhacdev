import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { User, Heart, Calendar, Settings, Award, Users, Edit, Save, X, Plus, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface UserStats {
  donationsMade: number
  totalDonated: number
  eventsAttended: number
  volunteerHours: number
}

interface RecentActivity {
  id: string
  type: 'donation' | 'event' | 'volunteer'
  title: string
  description: string
  date: string
  amount?: number
}

interface UpcomingEvent {
  id: string
  title: string
  date: string
  location: string
  registered: boolean
}

export function Dashboard() {
  const { profile, updateProfile, signOut } = useAuth()
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
  })
  const [saving, setSaving] = useState(false)
  const [userStats, setUserStats] = useState<UserStats>({
    donationsMade: 0,
    totalDonated: 0,
    eventsAttended: 0,
    volunteerHours: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
      })
      fetchUserData()
    }
  }, [profile])

  const fetchUserData = async () => {
    if (!profile) return

    try {
      // Fetch user donations
      const { data: donations } = await supabase
        .from('donations')
        .select('amount, created_at')
        .eq('donor_email', profile.email)
        .eq('payment_status', 'completed')

      // Fetch upcoming events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, date, location')
        .eq('published', true)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5)

      const donationCount = donations?.length || 0
      const totalDonated = donations?.reduce((sum, d) => sum + d.amount, 0) || 0

      setUserStats({
        donationsMade: donationCount,
        totalDonated,
        eventsAttended: 0, // Would need event registration tracking
        volunteerHours: 0, // Would need volunteer hour tracking
      })

      // Create recent activity from donations
      const donationActivities: RecentActivity[] = (donations || [])
        .slice(0, 3)
        .map(donation => ({
          id: `donation-${donation.created_at}`,
          type: 'donation' as const,
          title: 'Made a donation',
          description: `Contributed $${donation.amount} to support our programs`,
          date: donation.created_at,
          amount: donation.amount,
        }))

      setRecentActivity(donationActivities)

      // Set upcoming events (all unregistered by default)
      setUpcomingEvents((events || []).map(event => ({
        ...event,
        registered: false, // Would need event registration tracking
      })))
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    setSaving(true)
    try {
      const { error } = await updateProfile(profileForm)
      if (error) {
        alert('Error updating profile: ' + error.message)
      } else {
        setEditingProfile(false)
      }
    } catch (error) {
      alert('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const handleEventRegistration = async (eventId: string) => {
    setRegistering(eventId)
    try {
      // In a real app, you'd create an event registration record
      // For now, we'll just simulate the registration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUpcomingEvents(events =>
        events.map(event =>
          event.id === eventId ? { ...event, registered: true } : event
        )
      )
      
      // Add to recent activity
      const event = upcomingEvents.find(e => e.id === eventId)
      if (event) {
        const newActivity: RecentActivity = {
          id: `event-${eventId}`,
          type: 'event',
          title: 'Registered for event',
          description: `Registered for ${event.title}`,
          date: new Date().toISOString(),
        }
        setRecentActivity(prev => [newActivity, ...prev.slice(0, 2)])
      }
    } catch (error) {
      console.error('Error registering for event:', error)
      alert('Error registering for event')
    } finally {
      setRegistering(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return Heart
      case 'event':
        return Calendar
      case 'volunteer':
        return Users
      default:
        return Award
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'donation':
        return 'text-red-600'
      case 'event':
        return 'text-blue-600'
      case 'volunteer':
        return 'text-green-600'
      default:
        return 'text-purple-600'
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your impact dashboard and recent activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/donate"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Donations Made</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.donationsMade}</p>
                <p className="text-sm text-gray-500">${userStats.totalDonated.toFixed(2)} total</p>
              </div>
            </div>
          </Link>

          <Link
            to="/events"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Events Attended</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.eventsAttended}</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Volunteer Hours</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.volunteerHours}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Impact Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.min(85 + userStats.donationsMade * 5, 100)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start by making a donation or registering for an event
                  </p>
                </div>
              ) : (
                recentActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}>
                        <ActivityIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming events</p>
                  <Link
                    to="/events"
                    className="inline-block mt-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Browse available events →
                  </Link>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(event.date)} • {event.location}
                        </p>
                      </div>
                      <div>
                        {event.registered ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Registered
                          </span>
                        ) : (
                          <button
                            onClick={() => handleEventRegistration(event.id)}
                            disabled={registering === event.id}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                          >
                            {registering === event.id ? 'Registering...' : 'Register'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            {!editingProfile ? (
              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingProfile(false)
                    setProfileForm({
                      full_name: profile?.full_name || '',
                      phone: profile?.phone || '',
                      bio: profile?.bio || '',
                    })
                  }}
                  className="flex items-center px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {editingProfile ? (
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile?.full_name || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-gray-900">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {editingProfile ? (
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-900">{profile?.phone || 'Not provided'}</p>
              )}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {editingProfile ? (
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself"
                />
              ) : (
                <p className="text-gray-900">{profile?.bio || 'No bio provided'}</p>
              )}
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
            <Link
              to="/donate"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Heart className="h-5 w-5 mr-2" />
              Make a Donation
            </Link>
            <Link
              to="/contact"
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Users className="h-5 w-5 mr-2" />
              Volunteer Now
            </Link>
            <Link
              to="/events"
              className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Calendar className="h-5 w-5 mr-2" />
              View Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}