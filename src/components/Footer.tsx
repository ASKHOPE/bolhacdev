import React from 'react'
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../hooks/useSiteSettings'

export function Footer() {
  const { getSetting } = useSiteSettings()

  const siteName = getSetting('site_name', 'HopeFoundation')
  const siteDescription = getSetting('site_description', 'Dedicated to creating positive change in communities worldwide through education, healthcare, and sustainable development programs.')
  const contactEmail = getSetting('contact_email', 'info@hopefoundation.org')
  const contactPhone = getSetting('contact_phone', '+1 (555) 123-4567')
  const contactAddress = getSetting('contact_address', '123 Hope Street, City, State 12345')
  const logoUrl = getSetting('logo_url')

  const socialLinks = [
    { 
      icon: Facebook, 
      url: getSetting('facebook_url'), 
      name: 'Facebook' 
    },
    { 
      icon: Twitter, 
      url: getSetting('twitter_url'), 
      name: 'Twitter' 
    },
    { 
      icon: Instagram, 
      url: getSetting('instagram_url'), 
      name: 'Instagram' 
    },
    { 
      icon: Linkedin, 
      url: getSetting('linkedin_url'), 
      name: 'LinkedIn' 
    },
    { 
      icon: Youtube, 
      url: getSetting('youtube_url'), 
      name: 'YouTube' 
    }
  ].filter(link => link.url) // Only show links that have URLs

  return (
    <footer className="bg-theme-surface text-theme-text border-t border-theme-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={siteName}
                  className="h-8 w-auto"
                />
              ) : (
                <Heart className="h-8 w-8 text-theme-primary" />
              )}
              <span className="text-xl font-bold text-theme-text">{siteName}</span>
            </div>
            <p className="text-theme-text-secondary mb-6 max-w-md">
              {siteDescription}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a 
                    key={social.name}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-theme-text-secondary hover:text-theme-primary transition-all duration-200 transform hover:scale-110"
                    aria-label={social.name}
                  >
                    <social.icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-theme-text">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-theme-text-secondary hover:text-theme-primary transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-theme-text-secondary hover:text-theme-primary transition-colors duration-200">
                  Our Programs
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-theme-text-secondary hover:text-theme-primary transition-colors duration-200">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-theme-text-secondary hover:text-theme-primary transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-theme-text">Contact Info</h3>
            <div className="space-y-3">
              {contactEmail && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-theme-primary" />
                  <span className="text-theme-text-secondary">{contactEmail}</span>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-theme-primary" />
                  <span className="text-theme-text-secondary">{contactPhone}</span>
                </div>
              )}
              {contactAddress && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-theme-primary" />
                  <span className="text-theme-text-secondary">{contactAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-theme-border mt-8 pt-8 text-center">
          <p className="text-theme-text-secondary">
            © 2025 {siteName}. All rights reserved. Built with ❤️ for a better world.
          </p>
        </div>
      </div>
    </footer>
  )
}