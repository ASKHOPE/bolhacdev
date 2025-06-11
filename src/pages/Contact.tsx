import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, Clock, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      // Validate form data
      if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
        throw new Error('Please fill in all required fields')
      }

      // Submit to Supabase
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject,
          message: formData.message.trim(),
          status: 'new'
        }])

      if (error) throw error

      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      console.error('Error submitting contact form:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'info@hopefoundation.org',
      description: 'Send us an email anytime',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      description: 'Mon-Fri 9AM-5PM EST',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '123 Hope Street, City, State 12345',
      description: 'Our main office location',
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: 'Monday - Friday: 9AM - 5PM',
      description: 'Weekend by appointment',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100">
              Get in touch with us to learn more about our programs, volunteer opportunities, or how you can make a difference.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                  <div className="text-green-600 mb-4">
                    <CheckCircle className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-semibold text-green-800 mb-4">Message Sent Successfully!</h3>
                  <p className="text-green-700 mb-6">
                    Thank you for reaching out to us. We've received your message and will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="volunteer">Volunteer Opportunities</option>
                      <option value="donation">Donation Inquiry</option>
                      <option value="partnership">Partnership</option>
                      <option value="programs">Program Information</option>
                      <option value="media">Media Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                      placeholder="Tell us how we can help you..."
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {formData.message.length}/1000 characters
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </div>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-lg text-gray-600 mb-8">
                We'd love to hear from you. Whether you have questions about our programs, 
                want to volunteer, or are interested in partnering with us, we're here to help.
              </p>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <info.icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {info.title}
                      </h3>
                      <p className="text-blue-600 font-medium mb-1">
                        {info.details}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {info.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Time Info */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Response Times</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">General Inquiries:</span>
                    <span className="font-medium text-blue-900">Within 24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Volunteer Applications:</span>
                    <span className="font-medium text-blue-900">Within 48 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Partnership Inquiries:</span>
                    <span className="font-medium text-blue-900">Within 3-5 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Media Requests:</span>
                    <span className="font-medium text-blue-900">Within 24 hours</span>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8">
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Interactive map would go here</p>
                    <p className="text-sm text-gray-400 mt-1">123 Hope Street, City, State 12345</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions about our organization and programs.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: 'How can I volunteer with HopeFoundation?',
                answer: 'We welcome volunteers of all backgrounds and skill levels. You can apply through our volunteer portal, attend one of our orientation sessions, or contact us directly to discuss opportunities that match your interests and availability.',
              },
              {
                question: 'Where does my donation go?',
                answer: 'We maintain full transparency in our financial operations. 85% of donations go directly to program implementation, 10% to administrative costs, and 5% to fundraising activities. You can view our detailed financial reports on our website.',
              },
              {
                question: 'Do you accept in-kind donations?',
                answer: 'Yes, we accept various in-kind donations including educational materials, medical supplies, and equipment. Please contact us first to ensure your donation meets current needs and can be properly utilized.',
              },
              {
                question: 'How can my company partner with HopeFoundation?',
                answer: 'We offer various partnership opportunities including corporate sponsorships, employee volunteer programs, and cause marketing initiatives. Contact our partnership team to discuss how we can work together.',
              },
              {
                question: 'How quickly will I receive a response to my inquiry?',
                answer: 'We strive to respond to all inquiries within 24 hours during business days. Complex partnership or program inquiries may take 3-5 business days for a comprehensive response.',
              },
              {
                question: 'Can I schedule a visit to your facilities?',
                answer: 'Yes! We welcome visitors and offer guided tours of our facilities. Please contact us at least 48 hours in advance to schedule your visit and ensure someone is available to show you around.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}