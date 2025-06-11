import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Heart, User, Settings, Sun, Moon, Monitor } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useSiteSettings } from '../hooks/useSiteSettings'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { user, profile, signOut, isAdmin } = useAuth()
  const { theme, updateTheme } = useTheme()
  const { getSetting } = useSiteSettings()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Programs', href: '/programs' },
    { name: 'Events', href: '/events' },
    { name: 'Donate', href: '/donate' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActive = (path: string) => location.pathname === path

  const getThemeIcon = () => {
    switch (theme.mode) {
      case 'light':
        return Sun
      case 'dark':
        return Moon
      default:
        return Monitor
    }
  }

  const cycleTheme = () => {
    const modes = ['light', 'dark', 'auto'] as const
    const currentIndex = modes.indexOf(theme.mode)
    const nextIndex = (currentIndex + 1) % modes.length
    updateTheme({ mode: modes[nextIndex] })
  }

  const ThemeIcon = getThemeIcon()
  const siteName = getSetting('site_name', 'HopeFoundation')
  const logoUrl = getSetting('logo_url')

  return (
    <nav className="bg-theme-background shadow-lg sticky top-0 z-50 border-b border-theme-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={siteName}
                  className="h-8 w-auto transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <Heart className="h-8 w-8 text-theme-primary transition-transform duration-200 group-hover:scale-105" />
              )}
              <span className="text-xl font-bold text-theme-text transition-colors duration-200 group-hover:text-theme-primary">
                {siteName}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-theme text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-theme-primary bg-theme-surface shadow-sm'
                    : 'text-theme-text hover:text-theme-primary hover:bg-theme-surface'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-theme text-theme-text hover:text-theme-primary hover:bg-theme-surface transition-all duration-200 transform hover:scale-105"
              title={`Current: ${theme.mode} mode. Click to cycle themes.`}
            >
              <ThemeIcon className="h-5 w-5" />
            </button>
            
            {/* Admin Panel Link - Always visible for now */}
            <Link
              to="/admin"
              className={`flex items-center space-x-1 px-3 py-2 rounded-theme text-sm font-medium transition-all duration-200 ${
                location.pathname.startsWith('/admin')
                  ? 'text-theme-primary bg-theme-surface shadow-sm'
                  : 'text-theme-text hover:text-theme-primary hover:bg-theme-surface'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-3 py-2 rounded-theme text-sm font-medium text-theme-text hover:text-theme-primary hover:bg-theme-surface transition-all duration-200"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 rounded-theme text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-theme text-sm font-medium text-theme-text hover:text-theme-primary transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-theme text-sm font-medium text-white bg-theme-primary hover:opacity-90 transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-theme text-theme-text hover:text-theme-primary transition-all duration-200"
              title={`Current: ${theme.mode} mode`}
            >
              <ThemeIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-theme-text hover:text-theme-primary focus:outline-none focus:text-theme-primary transition-all duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-theme-background border-t border-theme-border">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-theme text-base font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-theme-primary bg-theme-surface'
                      : 'text-theme-text hover:text-theme-primary hover:bg-theme-surface'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Admin Panel Link - Mobile */}
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-theme text-base font-medium text-theme-text hover:text-theme-primary hover:bg-theme-surface transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Admin Panel
              </Link>
              
              {user ? (
                <div className="space-y-1 pt-2 border-t border-theme-border">
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-theme text-base font-medium text-theme-text hover:text-theme-primary hover:bg-theme-surface transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 rounded-theme text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-1 pt-2 border-t border-theme-border">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-theme text-base font-medium text-theme-text hover:text-theme-primary hover:bg-theme-surface transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-theme text-base font-medium text-white bg-theme-primary hover:opacity-90 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}