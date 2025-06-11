import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Users, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  image_url: string | null
  max_attendees: number | null
  current_attendees: number
  registration_fee: number
  published: boolean
  featured: boolean
  created_at: string
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setError(null)
      console.log('Fetching events from Supabase...')
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Events fetched:', data)
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Failed to load events. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const registerForEvent = async (eventId: string) => {
    setRegistering(eventId)
    try {
      // In a real app, you'd handle event registration here
      // For now, we'll just simulate the registration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update current attendees count
      const event = events.find(e => e.id === eventId)
      if (event && (event.max_attendees === null || event.current_attendees < event.max_attendees)) {
        const { error } = await supabase
          .from('events')
          .update({ current_attendees: event.current_attendees + 1 })
          .eq('id', eventId)

        if (error) throw error

        setEvents(events.map(e => 
          e.id === eventId 
            ? { ...e, current_attendees: e.current_attendees + 1 }
            : e
        ))
        
        alert('Successfully registered for the event!')
      } else {
        alert('Sorry, this event is full.')
      }
    } catch (error) {
      console.error('Error registering for event:', error)
      alert('Error registering for event. Please try again.')
    } finally {
      setRegistering(null)
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

  const isEventFull = (event: Event) => {
    return event.max_attendees !== null && event.current_attendees >= event.max_attendees
  }

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Calendar className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Events</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchEvents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
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
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Scheduled</h3>
              <p className="text-gray-600">
                Check back soon for upcoming events and activities, or contact us to learn about volunteer opportunities.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Join Our Upcoming Events
                </h2>
                <p className="text-lg text-gray-600">
                  We have {events.length} exciting event{events.length !== 1 ? 's' : ''} coming up. Register now to secure your spot!
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative">
                      <img
                        src={event.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      {event.featured && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                      {isEventFull(event) && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Full
                          </span>
                        </div>
                      )}
                      {isEventPast(event.date) && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Past Event
                          </span>
                        </div>
                      )}
                    </div>
                    
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
                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm">
                              {event.current_attendees}/{event.max_attendees || '∞'} attendees
                            </span>
                          </div>
                          {event.registration_fee > 0 && (
                            <span className="text-sm font-medium text-green-600">
                              ${event.registration_fee}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => registerForEvent(event.id)}
                        disabled={isEventFull(event) || isEventPast(event.date) || registering === event.id}
                        className={`w-full px-4 py-2 font-medium rounded-lg transition-colors ${
                          isEventFull(event) || isEventPast(event.date)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {registering === event.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Registering...
                          </div>
                        ) : isEventPast(event.date) ? (
                          'Event Ended'
                        ) : isEventFull(event) ? (
                          'Event Full'
                        ) : (
                          'Register Now'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
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