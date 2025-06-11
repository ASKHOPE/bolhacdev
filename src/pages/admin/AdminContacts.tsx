import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Mail, 
  Phone,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Reply,
  Eye,
  Trash2,
  RefreshCw,
  Download,
  Archive,
  Star,
  Calendar
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export function AdminContacts() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching contact messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', messageId)

      if (error) throw error
      
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: newStatus, updated_at: new Date().toISOString() } : msg
      ))
    } catch (error) {
      console.error('Error updating message status:', error)
      alert('Error updating message status: ' + (error as Error).message)
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
      
      setMessages(messages.filter(msg => msg.id !== messageId))
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Error deleting message: ' + (error as Error).message)
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setSendingReply(true)
    try {
      // In a real application, you would send an email here
      // For now, we'll just update the status to resolved
      await updateMessageStatus(selectedMessage.id, 'resolved')
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert(`Reply sent to ${selectedMessage.email}`)
      setReplyText('')
      setSelectedMessage(null)
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Error sending reply')
    } finally {
      setSendingReply(false)
    }
  }

  const getUniqueSubjects = () => {
    const subjects = [...new Set(messages.map(m => m.subject))]
    return subjects.filter(Boolean)
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter
    const matchesSubject = subjectFilter === 'all' || message.subject === subjectFilter
    return matchesSearch && matchesStatus && matchesSubject
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityBySubject = (subject: string) => {
    const highPriority = ['media', 'partnership', 'urgent']
    const mediumPriority = ['volunteer', 'donation']
    
    if (highPriority.some(p => subject.toLowerCase().includes(p))) return 'high'
    if (mediumPriority.some(p => subject.toLowerCase().includes(p))) return 'medium'
    return 'low'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      default:
        return 'text-green-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
            <p className="text-gray-600 mt-2">Manage incoming contact form submissions and customer inquiries</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchMessages}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-gray-900">
                {messages.filter(m => m.status === 'new').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {messages.filter(m => m.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {messages.filter(m => m.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {messages.filter(m => new Date(m.created_at).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {getUniqueSubjects().map(subject => (
                <option key={subject} value={subject}>
                  {subject.charAt(0).toUpperCase() + subject.slice(1).replace(/([A-Z])/g, ' $1')}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredMessages.length} of {messages.length} messages
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredMessages.map((message) => {
            const priority = getPriorityBySubject(message.subject)
            return (
              <div 
                key={message.id} 
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 ${
                  selectedMessage?.id === message.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                } ${
                  priority === 'high' ? 'border-l-red-500' : 
                  priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{message.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">{message.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">
                          {new Date(message.created_at).toLocaleDateString()} {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {message.subject.charAt(0).toUpperCase() + message.subject.slice(1).replace(/([A-Z])/g, ' $1')}
                      </h3>
                      <Star className={`h-4 w-4 ${getPriorityColor(priority)}`} />
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {message.message}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3 ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(message.status)}`}>
                      {getStatusIcon(message.status)}
                      <span className="ml-1 capitalize">{message.status.replace('_', ' ')}</span>
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMessage(message)
                        }}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteMessage(message.id)
                        }}
                        className="p-1 text-red-600 hover:text-red-900"
                        title="Delete Message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Messages Found</h3>
              <p className="text-gray-600">No contact messages match your current filters.</p>
            </div>
          )}
        </div>

        {/* Message Detail Panel */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Message Details</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">From</label>
                  <p className="text-gray-900">{selectedMessage.name}</p>
                  <p className="text-gray-600 text-sm">{selectedMessage.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <p className="text-gray-900 capitalize">
                    {selectedMessage.subject.replace(/([A-Z])/g, ' $1')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => updateMessageStatus(selectedMessage.id, e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Received</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(selectedMessage.created_at).toLocaleDateString()} at {new Date(selectedMessage.created_at).toLocaleTimeString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>

              {/* Quick Reply */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Quick Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || sendingReply}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingReply ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Reply className="h-4 w-4 mr-2" />
                    )}
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Message</h3>
              <p className="text-gray-600">Choose a message from the list to view details and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}