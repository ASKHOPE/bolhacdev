import React from 'react'
import { Wrench, Clock, AlertTriangle, Mail, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

interface MaintenancePageProps {
  allowAdminBypass?: boolean
}

export function MaintenancePage({ allowAdminBypass = true }: MaintenancePageProps) {
  const { maintenance } = useTheme()
  const { isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Admin Bypass Notice */}
        {allowAdminBypass && isAdmin && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Admin Access</p>
                <p className="text-sm text-yellow-700">
                  You can access the admin panel during maintenance.
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Link
                to="/admin"
                className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Admin Panel
              </Link>
            </div>
          </div>
        )}

        {/* Main Maintenance Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <Wrench className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              We'll Be Right Back!
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {maintenance.message}
            </p>
          </div>

          {/* Estimated Time */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-3">
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-lg font-semibold text-blue-900">
                Estimated Completion Time
              </h2>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {maintenance.estimatedTime}
            </p>
            <p className="text-sm text-blue-700 mt-2">
              We appreciate your patience while we improve your experience.
            </p>
          </div>

          {/* What We're Doing */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What We're Working On
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-900">Performance</p>
                <p className="text-xs text-gray-600 mt-1">Optimizing speed</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-900">Features</p>
                <p className="text-xs text-gray-600 mt-1">Adding new tools</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-900">Security</p>
                <p className="text-xs text-gray-600 mt-1">Enhancing protection</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 mb-4">
              Need immediate assistance? Contact our support team:
            </p>
            <div className="flex items-center justify-center space-x-6">
              <a
                href="mailto:support@hopefoundation.org"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">support@hopefoundation.org</span>
              </a>
            </div>
          </div>

          {/* Progress Animation */}
          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Maintenance in progress...</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Follow us on social media for real-time updates
          </p>
        </div>
      </div>
    </div>
  )
}