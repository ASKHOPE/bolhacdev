import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  image_url: string | null
  published: boolean
  created_at: string
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Sample events for when database is empty
  const sampleEvents = [
    {
      id: '1',
      title: 'Annual Charity Gala',
      description: 'Join us for an evening of celebration and fundraising to support our education initiatives. Featuring dinner, entertainment, and inspiring stories from our beneficiaries.',
      date: '2025-03-15T19:00:00',
      location: 'Grand Ballroom, City Convention Center',
      image_url: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
      published: true,
      created_at: '2025-01-01T00:00:00',
    },
    {
      id: '2',
      title: 'Community Health Fair',
      description: 'Free health screenings, vaccinations, and wellness education for the entire community. Healthcare professionals will be available for consultations.',
      date: '2025-02-28T09:00:00',
      location: 'Central Park Community Center',
      image_url: 'https://images.pexels.com/photos/6303773/pexels-photo-6303773.jpeg?auto=compress&cs=tinysrgb&w=800',
      published: true,
      created_at: '2025-01-01T00:00:00',
    },
    {
      id: '3',
      title: 'Volunteer Training Workshop',
      description: 'Comprehensive training session for new volunteers. Learn about our programs, safety protocols, and how to make the biggest impact in your community service.',
      date: '2025-02-20T10:00:00',
      location: 'HopeFoundation Training Center',
      image_url: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800',
      published: true,
      created_at: '2025-01-01T00:00:00',
    },
    {
      id: '4',
      title: 'Clean Water Project Launch',
      description: 'Ceremony to launch our new clean water initiative in rural communities. Learn about the project and how you can contribute to bringing clean water to those in need.',
      date: '2025-04-10T14:00:00',
      location: 'Project Site, Rural District',
      image_url: 'https://images.pexels.com/photos/6962024/pexels-photo-6962024.jpeg?auto=compress&cs=tinysrgb&w=800',
      published: true,
      created_at: '2025-01-01T00:00:00',
    },
  ]

  const displayEvents = events.length > 0 ? events : sampleEvents

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Upcoming Events</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100">
              Join us in our mission to create positive change. Participate in our events and be part of something meaningful.
            </p>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {displayEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Scheduled</h3>
              <p className="text-gray-600">Check back soon for upcoming events and activities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {displayEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <img
                    src={event.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-sm">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-sm">{formatTime(event.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Register Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Subscribe to our newsletter to receive updates about upcoming events, program news, and ways to get involved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}