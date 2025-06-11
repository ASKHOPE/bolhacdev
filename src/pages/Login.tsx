import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSettings } from '../hooks/useSiteSettings'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { getSetting } = useSiteSettings()

  const siteName = getSetting('site_name', 'HopeFoundation')
  const logoUrl = getSetting('logo_url')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-theme-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={siteName}
              className="h-12 w-auto"
            />
          ) : (
            <Heart className="h-12 w-12 text-theme-primary" />
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-theme-text">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-theme-text-secondary">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-theme-primary hover:text-theme-accent transition-colors duration-200"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="theme-card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-theme text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-theme-text">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="theme-input appearance-none block w-full px-3 py-2 placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-theme-text">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="theme-input appearance-none block w-full px-3 py-2 pr-10 placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-text-secondary hover:text-theme-text transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-theme-border rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-theme-text">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-theme-primary hover:text-theme-accent transition-colors duration-200">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="theme-button w-full flex justify-center py-2 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-theme-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-theme-surface text-theme-text-secondary">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs text-theme-text-secondary bg-theme-surface p-3 rounded-theme border border-theme-border">
                <p className="font-medium mb-1">Demo Admin Account:</p>
                <p>Email: admin@hopefoundation.org</p>
                <p>Password: admin123</p>
              </div>
              <div className="text-xs text-theme-text-secondary bg-theme-surface p-3 rounded-theme border border-theme-border">
                <p className="font-medium mb-1">Demo User Account:</p>
                <p>Email: user@hopefoundation.org</p>
                <p>Password: user123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}