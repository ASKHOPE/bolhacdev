import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, Heart, Globe, Award, Calendar } from 'lucide-react'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { useSiteStats } from '../hooks/useSiteStats'
import { useTheme } from '../contexts/ThemeContext'

const iconMap = {
  Users,
  Heart,
  Globe,
  Award,
  Calendar
}

export function Home() {
  const { getSetting } = useSiteSettings()
  const { getStatsByPage, loading: statsLoading } = useSiteStats()
  const { theme } = useTheme()
  
  const siteName = getSetting('site_name', 'HopeFoundation')
  const siteDescription = getSetting('site_description', 'Creating positive change in communities worldwide through education, healthcare, and sustainable development programs.')

  const homeStats = getStatsByPage('home')

  const programs = [
    {
      title: 'Education Initiative',
      description: 'Providing quality education and learning resources to underserved communities.',
      image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      title: 'Healthcare Access',
      description: 'Ensuring basic healthcare services reach remote and marginalized areas.',
      image: 'https://images.pexels.com/photos/6303773/pexels-photo-6303773.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      title: 'Clean Water Project',
      description: 'Building sustainable water systems for communities in need.',
      image: 'https://images.pexels.com/photos/6962024/pexels-photo-6962024.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  ]

  return (
    <div className="min-h-screen bg-theme-background transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-theme-primary to-theme-accent text-white transition-all duration-300">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in text-theme-title">
              Creating Hope, <br />
              <span className="text-theme-subtitle">Changing Lives</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-theme-subtitle animate-fade-in-delay">
              {siteDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
              <Link
                to="/programs"
                className="inline-flex items-center px-8 py-4 bg-white text-theme-primary font-semibold rounded-theme hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                Explore Our Programs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/donate"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-theme hover:bg-white hover:text-theme-primary transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                Donate Now
                <Heart className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-theme-surface transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center animate-pulse">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {homeStats.map((stat, index) => {
                const IconComponent = iconMap[stat.icon as keyof typeof iconMap] || Users
                return (
                  <div key={stat.id} className="text-center group">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-primary text-white rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div className="text-3xl font-bold text-theme-text transition-colors duration-300 mb-2">{stat.value}</div>
                    <div className="text-theme-text-secondary transition-colors duration-300">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-theme-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-text transition-colors duration-300 mb-4">
              Our Impact Programs
            </h2>
            <p className="text-xl text-theme-text-secondary transition-colors duration-300 max-w-3xl mx-auto">
              We focus on sustainable solutions that create lasting change in communities worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div key={index} className="theme-card overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-theme-text transition-colors duration-300 mb-3">
                    {program.title}
                  </h3>
                  <p className="text-theme-text-secondary transition-colors duration-300 mb-4">
                    {program.description}
                  </p>
                  <Link
                    to="/programs"
                    className="inline-flex items-center text-theme-primary font-medium hover:text-theme-accent transition-colors duration-300"
                  >
                    Learn More
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-theme-primary text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-theme-title">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-theme-subtitle">
            Whether through volunteering, donating, or spreading awareness, 
            every action counts in creating positive change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-theme-primary font-semibold rounded-theme hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Get Involved
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-theme hover:bg-white hover:text-theme-primary transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Learn About Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}