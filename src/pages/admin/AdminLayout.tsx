import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  Heart, 
  BarChart3, 
  FileText,
  ArrowLeft,
  MessageSquare,
  Mail,
  FolderOpen,
  Target,
  Palette
} from 'lucide-react'

export function AdminLayout() {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Programs', href: '/admin/programs', icon: FolderOpen },
    { name: 'Projects', href: '/admin/projects', icon: Target },
    { name: 'Events', href: '/admin/events', icon: Calendar },
    { name: 'Donations', href: '/admin/donations', icon: Heart },
    { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare },
    { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Content', href: '/admin/content', icon: FileText },
    { name: 'Theme', href: '/admin/theme', icon: Palette },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Website
            </Link>
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          </div>
          
          <nav className="px-4 pb-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}