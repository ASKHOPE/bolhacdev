import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Heart, CreditCard, Shield, Users, Target, Globe, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface DonationFormData {
  amount: string
  customAmount: string
  donorName: string
  donorEmail: string
  message: string
  isAnonymous: boolean
  selectedProject: string
  selectedProgram: string
}

interface Project {
  id: string
  title: string
  description: string
  location: string
  target_amount: number
  raised_amount: number
  program_category: string
  image_url: string
  beneficiaries: number
}

export function Donate() {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState<DonationFormData>({
    amount: '50',
    customAmount: '',
    donorName: '',
    donorEmail: '',
    message: '',
    isAnonymous: false,
    selectedProject: searchParams.get('project') || '',
    selectedProgram: searchParams.get('program') || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const predefinedAmounts = ['25', '50', '100', '250', '500', 'custom']

  const programCategories = {
    education: { title: 'Education Initiative', color: 'blue' },
    healthcare: { title: 'Healthcare Access', color: 'red' },
    'clean-water': { title: 'Clean Water Project', color: 'cyan' },
    housing: { title: 'Housing Development', color: 'green' },
    'community-empowerment': { title: 'Community Empowerment', color: 'purple' },
    innovation: { title: 'Innovation Lab', color: 'yellow' }
  }

  useEffect(() => {
    fetchProjects()
    
    // Auto-expand the selected program
    if (formData.selectedProgram) {
      setExpandedPrograms(new Set([formData.selectedProgram]))
    }
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleAmountChange = (amount: string) => {
    setFormData({ ...formData, amount, customAmount: amount === 'custom' ? formData.customAmount : '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const getDonationAmount = () => {
    if (formData.amount === 'custom') {
      return parseFloat(formData.customAmount) || 0
    }
    return parseFloat(formData.amount) || 0
  }

  const toggleProgramExpansion = (programId: string) => {
    const newExpanded = new Set(expandedPrograms)
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId)
    } else {
      newExpanded.add(programId)
    }
    setExpandedPrograms(newExpanded)
  }

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100)
  }

  const getSelectedProjectDetails = () => {
    return projects.find(p => p.id === formData.selectedProject)
  }

  const getFilteredProjects = () => {
    return projects.filter(project => {
      const matchesSearch = !searchTerm || 
                           project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.location.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesProgram = !formData.selectedProgram || project.program_category === formData.selectedProgram
      
      return matchesSearch && matchesProgram
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const donationAmount = getDonationAmount()
    
    if (donationAmount < 1) {
      setError('Please enter a valid donation amount')
      setLoading(false)
      return
    }

    if (!formData.donorName.trim() || !formData.donorEmail.trim()) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      // Create payment intent
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: Math.round(donationAmount * 100), // Convert to cents
          donorName: formData.donorName,
          donorEmail: formData.donorEmail,
          message: formData.message,
          projectId: formData.selectedProject,
          programCategory: formData.selectedProgram,
        }),
      })

      const { clientSecret, error: paymentError } = await response.json()

      if (paymentError) {
        throw new Error(paymentError)
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: clientSecret,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const impactStats = [
    {
      icon: Users,
      amount: '$25',
      impact: 'Provides school supplies for 5 children',
    },
    {
      icon: Heart,
      amount: '$50',
      impact: 'Funds a health checkup for a family',
    },
    {
      icon: Target,
      amount: '$100',
      impact: 'Supports a month of clean water access',
    },
    {
      icon: Globe,
      amount: '$250',
      impact: 'Sponsors a child\'s education for a semester',
    },
  ]

  const selectedProject = getSelectedProjectDetails()
  const filteredProjects = getFilteredProjects()

  return (
    <div className="min-h-screen bg-theme-background transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-theme-primary to-theme-accent text-white transition-colors duration-300 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="h-16 w-16 mx-auto mb-6 text-blue-200 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">Make a Donation</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100 animate-fade-in-delay">
              Your generosity creates lasting change in communities worldwide. 
              Every donation makes a real difference in someone's life.
            </p>
          </div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="py-20 bg-theme-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Donation Form */}
            <div className="theme-card p-8">
              <h2 className="text-2xl font-bold text-theme-text transition-colors duration-300 mb-6">Choose Your Donation Amount</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-theme text-sm">
                    {error}
                  </div>
                )}

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-medium text-theme-text transition-colors duration-300 mb-3">
                    Select a Project (Optional)
                  </label>
                  
                  {/* Search Projects */}
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-theme-background border border-theme-border rounded-theme focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors duration-300"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center p-3 bg-theme-surface border border-theme-border rounded-theme hover:bg-theme-background transition-colors duration-300">
                        <input
                          type="radio"
                          name="selectedProject"
                          value=""
                          checked={formData.selectedProject === ''}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-theme-border"
                        />
                        <span className="ml-2 text-theme-text transition-colors duration-300">General Fund (Where needed most)</span>
                      </label>
                    </div>
                    
                    {Object.entries(programCategories).map(([programId, program]) => {
                      const programProjects = filteredProjects.filter(p => p.program_category === programId)
                      if (programProjects.length === 0) return null
                      
                      return (
                        <div key={programId} className="border border-theme-border rounded-theme overflow-hidden transition-colors duration-300">
                          <button
                            type="button"
                            onClick={() => toggleProgramExpansion(programId)}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-theme-surface transition-colors duration-300"
                          >
                            <span className="font-medium text-theme-text transition-colors duration-300">{program.title}</span>
                            {expandedPrograms.has(programId) ? (
                              <ChevronUp className="h-4 w-4 text-theme-text-secondary transition-colors duration-300" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-theme-text-secondary transition-colors duration-300" />
                            )}
                          </button>
                          
                          {expandedPrograms.has(programId) && (
                            <div className="border-t border-theme-border p-3 space-y-2 transition-colors duration-300">
                              {programProjects.map((project) => (
                                <label 
                                  key={project.id} 
                                  className="flex items-start space-x-3 p-2 hover:bg-theme-surface rounded-theme transition-colors duration-300"
                                >
                                  <input
                                    type="radio"
                                    name="selectedProject"
                                    value={project.id}
                                    checked={formData.selectedProject === project.id}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-theme-border mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-theme-text transition-colors duration-300">{project.title}</div>
                                    <div className="text-xs text-theme-text-secondary transition-colors duration-300">{project.location}</div>
                                    <div className="text-xs text-theme-text-secondary transition-colors duration-300 mt-1">
                                      ${project.raised_amount.toLocaleString()} raised of ${project.target_amount.toLocaleString()} goal
                                    </div>
                                    <div className="w-full bg-theme-border rounded-full h-1 mt-1 transition-colors duration-300">
                                      <div
                                        className="bg-theme-primary h-1 rounded-full transition-all duration-300"
                                        style={{ width: `${getProgressPercentage(project.raised_amount, project.target_amount)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Selected Project Details */}
                {selectedProject && (
                  <div className="bg-theme-surface border border-theme-border rounded-theme p-4 transition-colors duration-300">
                    <h3 className="font-medium text-theme-text transition-colors duration-300 mb-2">Supporting: {selectedProject.title}</h3>
                    <p className="text-sm text-theme-text-secondary transition-colors duration-300 mb-2">{selectedProject.description}</p>
                    <div className="text-xs text-theme-text-secondary transition-colors duration-300">
                      📍 {selectedProject.location} • 👥 {selectedProject.beneficiaries.toLocaleString()} beneficiaries
                    </div>
                  </div>
                )}

                {/* Amount Selection */}
                <div>
                  <label className="block text-sm font-medium text-theme-text transition-colors duration-300 mb-3">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {predefinedAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleAmountChange(amount)}
                        className={`p-3 border-2 rounded-theme font-medium transition-all duration-300 ${
                          formData.amount === amount
                            ? 'border-theme-primary bg-theme-surface text-theme-primary shadow-md'
                            : 'border-theme-border hover:border-theme-primary/50 text-theme-text'
                        }`}
                      >
                        {amount === 'custom' ? 'Custom' : `$${amount}`}
                      </button>
                    ))}
                  </div>
                  
                  {formData.amount === 'custom' && (
                    <div>
                      <label htmlFor="customAmount" className="block text-sm font-medium text-theme-text transition-colors duration-300 mb-2">
                        Custom Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary transition-colors duration-300">$</span>
                        <input
                          type="number"
                          id="customAmount"
                          name="customAmount"
                          min="1"
                          step="0.01"
                          value={formData.customAmount}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-3 bg-theme-background border border-theme-border rounded-theme focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors duration-300"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Donor Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="donorName" className="block text-sm font-medium text-theme-text transition-colors duration-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="donorName"
                      name="donorName"
                      required
                      value={formData.donorName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-theme-background border border-theme-border rounded-theme focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors duration-300"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="donorEmail" className="block text-sm font-medium text-theme-text transition-colors duration-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="donorEmail"
                      name="donorEmail"
                      required
                      value={formData.donorEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-theme-background border border-theme-border rounded-theme focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors duration-300"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-theme-text transition-colors duration-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-theme-background border border-theme-border rounded-theme focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-colors duration-300"
                    placeholder="Leave a message of support..."
                  />
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center">
                  <input
                    id="isAnonymous"
                    name="isAnonymous"
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-theme-border rounded transition-colors duration-300"
                  />
                  <label htmlFor="isAnonymous" className="ml-2 block text-sm text-theme-text transition-colors duration-300">
                    Make this donation anonymous
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || getDonationAmount() < 1}
                  className="w-full flex items-center justify-center px-6 py-4 bg-theme-primary text-white font-semibold rounded-theme hover:bg-opacity-90 focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:translate-y-[-2px] hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Donate ${getDonationAmount().toFixed(2)}
                    </div>
                  )}
                </button>

                {/* Security Notice */}
                <div className="flex items-center justify-center text-sm text-theme-text-secondary transition-colors duration-300">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure payment powered by Stripe
                </div>
              </form>
            </div>

            {/* Impact Information */}
            <div className="space-y-8">
              <div className="bg-theme-surface rounded-theme p-8 border border-theme-border transition-colors duration-300">
                <h3 className="text-2xl font-bold text-theme-text transition-colors duration-300 mb-6">Your Impact</h3>
                <div className="space-y-4">
                  {impactStats.map((stat, index) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-4 p-3 bg-theme-background rounded-theme hover:shadow-md transition-all duration-300 transform hover:translate-x-1"
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-theme-primary rounded-lg flex items-center justify-center transition-colors duration-300">
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-theme-primary transition-colors duration-300">{stat.amount}</div>
                        <div className="text-theme-text transition-colors duration-300">{stat.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-theme-surface rounded-theme p-8 border border-theme-border transition-colors duration-300">
                <h3 className="text-xl font-bold text-theme-text transition-colors duration-300 mb-4">Why Donate?</h3>
                <ul className="space-y-3 text-theme-text transition-colors duration-300">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-theme-primary rounded-full mt-2 mr-3 flex-shrink-0 transition-colors duration-300"></div>
                    <span>85% of donations go directly to programs</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-theme-primary rounded-full mt-2 mr-3 flex-shrink-0 transition-colors duration-300"></div>
                    <span>Tax-deductible in the United States</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-theme-primary rounded-full mt-2 mr-3 flex-shrink-0 transition-colors duration-300"></div>
                    <span>Transparent reporting on fund usage</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-theme-primary rounded-full mt-2 mr-3 flex-shrink-0 transition-colors duration-300"></div>
                    <span>Immediate impact in communities</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-theme p-8 border border-green-200 dark:border-green-900/30 transition-colors duration-300">
                <h3 className="text-xl font-bold text-green-800 dark:text-green-300 transition-colors duration-300 mb-4">Recent Achievements</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white dark:bg-green-900/30 rounded-theme shadow-sm transition-colors duration-300">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">1,250</div>
                    <div className="text-sm text-green-700 dark:text-green-300 transition-colors duration-300">Children educated</div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-green-900/30 rounded-theme shadow-sm transition-colors duration-300">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">45</div>
                    <div className="text-sm text-green-700 dark:text-green-300 transition-colors duration-300">Wells built</div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-green-900/30 rounded-theme shadow-sm transition-colors duration-300">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">8,500</div>
                    <div className="text-sm text-green-700 dark:text-green-300 transition-colors duration-300">Medical treatments</div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-green-900/30 rounded-theme shadow-sm transition-colors duration-300">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">320</div>
                    <div className="text-sm text-green-700 dark:text-green-300 transition-colors duration-300">Homes built</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-theme-surface transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-theme-text transition-colors duration-300 text-center mb-12">
            Donation FAQ
          </h2>
          <div className="space-y-6">
            {[
              {
                question: 'Is my donation secure?',
                answer: 'Yes, all donations are processed through Stripe, a secure payment processor used by millions of businesses worldwide. We never store your payment information.',
              },
              {
                question: 'Will I receive a tax receipt?',
                answer: 'Yes, you will receive an email receipt immediately after your donation, which serves as your tax-deductible receipt for US tax purposes.',
              },
              {
                question: 'How is my donation used?',
                answer: '85% of your donation goes directly to our programs, 10% covers administrative costs, and 5% supports fundraising activities. We publish annual reports detailing our financial transparency.',
              },
              {
                question: 'Can I make a recurring donation?',
                answer: 'Yes, you can set up monthly recurring donations by contacting us directly. This helps us plan long-term projects and creates sustained impact.',
              },
            ].map((faq, index) => (
              <div 
                key={index} 
                className="theme-card p-6 hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <h3 className="text-lg font-semibold text-theme-text transition-colors duration-300 mb-3">
                  {faq.question}
                </h3>
                <p className="text-theme-text-secondary transition-colors duration-300">
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