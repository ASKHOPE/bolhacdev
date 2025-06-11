import React from 'react'
import { Users, Target, Award, Heart } from 'lucide-react'
import { useSiteSettings } from '../hooks/useSiteSettings'

export function About() {
  const { getSetting } = useSiteSettings()
  
  const siteName = getSetting('site_name', 'HopeFoundation')
  const siteDescription = getSetting('site_description', 'Creating positive change in communities worldwide through education, healthcare, and sustainable development programs.')

  const values = [
    {
      icon: Heart,
      title: 'Compassion',
      description: 'We approach every challenge with empathy and understanding, putting people first in everything we do.',
    },
    {
      icon: Target,
      title: 'Impact',
      description: 'We focus on creating measurable, sustainable change that transforms communities for the better.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe in the power of partnership and work closely with local communities and organizations.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for the highest standards in all our programs and maintain transparency in our operations.',
    },
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Executive Director',
      image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: '15+ years in international development and humanitarian work.',
    },
    {
      name: 'Michael Chen',
      role: 'Program Director',
      image: 'https://images.pexels.com/photos/3777931/pexels-photo-3777931.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Expert in sustainable development and community engagement.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Operations Manager',
      image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Specialist in nonprofit operations and volunteer coordination.',
    },
  ]

  return (
    <div className="min-h-screen bg-theme-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-theme-primary to-theme-accent text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About {siteName}</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100">
              Founded in 2010, we've been dedicated to creating sustainable change 
              in communities worldwide through innovative programs and partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-theme-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-theme-text mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-theme-text-secondary mb-6">
                {siteDescription}
              </p>
              <p className="text-lg text-theme-text-secondary mb-8">
                We believe that every person deserves the opportunity to thrive, regardless of 
                their circumstances. Through our comprehensive programs and dedicated partnerships, 
                we work to break cycles of poverty and build stronger, more resilient communities.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 theme-card">
                  <div className="text-3xl font-bold text-theme-primary mb-2">15+</div>
                  <div className="text-theme-text-secondary">Years of Impact</div>
                </div>
                <div className="text-center p-4 theme-card">
                  <div className="text-3xl font-bold text-theme-primary mb-2">25</div>
                  <div className="text-theme-text-secondary">Countries Served</div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Our mission in action"
                className="rounded-theme shadow-lg transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-theme-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-text mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto">
              These principles guide everything we do and shape our approach to creating positive change.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="theme-card p-6 text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-primary text-white rounded-full mb-4 transition-all duration-200 group-hover:scale-110">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-theme-text mb-3">
                  {value.title}
                </h3>
                <p className="text-theme-text-secondary">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-theme-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-text mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-theme-text-secondary max-w-3xl mx-auto">
              Our dedicated team brings together diverse expertise and a shared passion for making a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="theme-card overflow-hidden group">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-theme-text mb-2">
                    {member.name}
                  </h3>
                  <p className="text-theme-primary font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-theme-text-secondary">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-theme-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Our Impact by the Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            <div className="group">
              <div className="text-4xl font-bold mb-2 transition-transform duration-200 group-hover:scale-110">50,000+</div>
              <div className="text-blue-200">Lives Impacted</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold mb-2 transition-transform duration-200 group-hover:scale-110">150+</div>
              <div className="text-blue-200">Projects Completed</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold mb-2 transition-transform duration-200 group-hover:scale-110">1,200+</div>
              <div className="text-blue-200">Active Volunteers</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold mb-2 transition-transform duration-200 group-hover:scale-110">$2.5M+</div>
              <div className="text-blue-200">Funds Raised</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}