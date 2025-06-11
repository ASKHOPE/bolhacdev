import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Users, Plus, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [showFilters, setShowFilters] = useState(false)

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

  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const isPast = isEventPast(event.date)
      const matchesDate = dateFilter === 'all' || 
                         (dateFilter === 'upcoming' && !isPast) ||
                         (dateFilter === 'past' && isPast)
      
      return matchesSearch && matchesDate
    })
  }

  const filteredEvents = getFilteredEvents()
  const upcomingCount = events.filter(e => !isEventPast(e.date)).length
  const pastCount = events.filter(e => isEventPast(e.date)).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-background transition-colors duration-300">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-theme-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-background transition-colors duration-300">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Calendar className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-semibold text-theme-text transition-colors duration-300 mb-2">Error Loading Events</h3>
          <p className="text-theme-text-secondary transition-colors duration-300 mb-4">{error}</p>
          <button 
            onClick={fetchEvents}
            className="px-4 py-2 bg-theme-primary text-white rounded-theme hover:bg-opacity-90 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-background transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-theme-primary to-theme-accent text-white transition-colors duration-300 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">Upcoming Events</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100 animate-fade-in-delay">
              Join us in our mission to create positive change. Participate in our events and be part of something meaningful.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-theme-surface transition-colors duration-300 border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-1/2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary h-5 w-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-theme-background border border-theme-border rounded-theme focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors duration-300"
              />
            </div>
            <div className="w-full md:w-auto flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-theme-background border border-theme-border rounded-theme hover:bg-theme-surface transition-colors duration-300"
              >
                <Filter className="h-5 w-5 text-theme-text-secondary" />
                <span className="text-theme-text transition-colors duration-300">Filters</span>
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 text-theme-text-secondary" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-theme-text-secondary" />
                )}
              </button>
              <div className="hidden md:flex items-center space-x-2 text-theme-text-secondary transition-colors duration-300">
                <span className="text-sm">
                  Showing {filteredEvents.length} of {events.length} events
                </span>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-theme-background border border-theme-border rounded-theme transition-colors duration-300">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text-secondary mb-2">Date</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setDateFilter('all')}
                      className={`px-4 py-2 rounded-theme text-sm font-medium transition-colors duration-300 ${
                        dateFilter === 'all'
                          ? 'bg-theme-primary text-white'
                          : 'bg-theme-surface text-theme-text-secondary hover:bg-theme-border'
                      }`}
                    >
                      All ({events.length})
                    </button>
                    <button
                      onClick={() => setDateFilter('upcoming')}
                      className={`px-4 py-2 rounded-theme text-sm font-medium transition-colors duration-300 ${
                        dateFilter === 'upcoming'
                          ? 'bg-theme-primary text-white'
                          : 'bg-theme-surface text-theme-text-secondary hover:bg-theme-border'
                      }`}
                    >
                      Upcoming ({upcomingCount})
                    </button>
                    <button
                      onClick={() => setDateFilter('past')}
                      className={`px-4 py-2 rounded-theme text-sm font-medium transition-colors duration-300 ${
                        dateFilter === 'past'
                          ? 'bg-theme-primary text-white'
                          : 'bg-theme-surface text-theme-text-secondary hover:bg-theme-border'
                      }`}
                    >
                      Past ({pastCount})
                    </button>
                  </div>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setDateFilter('upcoming')
                    }}
                    className="px-4 py-2 text-theme-text-secondary hover:text-theme-primary transition-colors duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 bg-theme-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-theme-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-theme-text transition-colors duration-300 mb-2">No Events Found</h3>
              <p className="text-theme-text-secondary transition-colors duration-300">
                {events.length === 0 
                  ? "Check back soon for upcoming events and activities, or contact us to learn about volunteer opportunities."
                  : "No events match your current search criteria. Try adjusting your filters."}
              </p>
              {(searchTerm || dateFilter !== 'upcoming') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setDateFilter('upcoming')
                  }}
                  className="mt-4 px-4 py-2 bg-theme-primary text-white rounded-theme hover:bg-opacity-90 transition-colors duration-300"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-theme-text transition-colors duration-300 mb-4">
                  {dateFilter === 'past' ? 'Past Events' : 'Join Our Upcoming Events'}
                </h2>
                <p className="text-lg text-theme-text-secondary transition-colors duration-300">
                  {dateFilter === 'past' 
                    ? `Explore our ${filteredEvents.length} past event${filteredEvents.length !== 1 ? 's' : ''} and their impact.`
                    : `We have ${filteredEvents.length} exciting event${filteredEvents.length !== 1 ? 's' : ''} coming up. Register now to secure your spot!`}
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className="theme-card overflow-hidden group transform hover:scale-105 transition-all duration-300"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={event.image_url || 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={event.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {event.featured && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                            Featured
                          </span>
                        </div>
                      )}
                      {isEventFull(event) && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                            Full
                          </span>
                        </div>
                      )}
                      {isEventPast(event.date) && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                            Past Event
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-theme-text transition-colors duration-300 mb-3">
                        {event.title}
                      </h3>
                      <p className="text-theme-text-secondary transition-colors duration-300 mb-4 line-clamp-3">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-theme-text-secondary transition-colors duration-300">
                          <Calendar className="h-4 w-4 mr-2 text-theme-primary transition-colors duration-300" />
                          <span className="text-sm">{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center text-theme-text-secondary transition-colors duration-300">
                          <Clock className="h-4 w-4 mr-2 text-theme-primary transition-colors duration-300" />
                          <span className="text-sm">{formatTime(event.date)}</span>
                        </div>
                        <div className="flex items-center text-theme-text-secondary transition-colors duration-300">
                          <MapPin className="h-4 w-4 mr-2 text-theme-primary transition-colors duration-300" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-theme-text-secondary transition-colors duration-300">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-theme-primary transition-colors duration-300" />
                            <span className="text-sm">
                              {event.current_attendees}/{event.max_attendees || '∞'} attendees
                            </span>
                          </div>
                          {event.registration_fee > 0 && (
                            <span className="text-sm font-medium text-theme-primary transition-colors duration-300">
                              ${event.registration_fee}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => registerForEvent(event.id)}
                        disabled={isEventFull(event) || isEventPast(event.date) || registering === event.id}
                        className={`w-full px-4 py-3 font-medium rounded-theme transition-all duration-300 ${
                          isEventFull(event) || isEventPast(event.date)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-theme-primary text-white hover:bg-opacity-90 transform hover:translate-y-[-2px] hover:shadow-lg'
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
                          <div className="flex items-center justify-center">
                            <Plus className="h-4 w-4 mr-2" />
                            Register Now
                          </div>
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
      <section className="py-20 bg-theme-surface transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-theme-text transition-colors duration-300 mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-theme-text-secondary transition-colors duration-300 mb-8">
              Subscribe to our newsletter to receive updates about upcoming events, program news, and ways to get involved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-theme-background border border-theme-border rounded-theme focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors duration-300"
              />
              <button className="px-6 py-3 bg-theme-primary text-white font-medium rounded-theme hover:bg-opacity-90 transition-colors duration-300 transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}