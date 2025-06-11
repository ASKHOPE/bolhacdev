import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Heart, CreditCard, Shield, Users, Target, Globe } from 'lucide-react'
import { supabase } from '../lib/supabase'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface DonationFormData {
  amount: string
  customAmount: string
  donorName: string
  donorEmail: string
  message: string
  isAnonymous: boolean
}

export function Donate() {
  const [formData, setFormData] = useState<DonationFormData>({
    amount: '50',
    customAmount: '',
    donorName: '',
    donorEmail: '',
    message: '',
    isAnonymous: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const predefinedAmounts = ['25', '50', '100', '250', '500', 'custom']

  const handleAmountChange = (amount: string) => {
    setFormData({ ...formData, amount, customAmount: amount === 'custom' ? formData.customAmount : '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Make a Donation</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100">
              Your generosity creates lasting change in communities worldwide. 
              Every donation makes a real difference in someone's life.
            </p>
          </div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Donation Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Donation Amount</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Amount Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {predefinedAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleAmountChange(amount)}
                        className={`p-3 border-2 rounded-lg font-medium transition-colors ${
                          formData.amount === amount
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {amount === 'custom' ? 'Custom' : `$${amount}`}
                      </button>
                    ))}
                  </div>
                  
                  {formData.amount === 'custom' && (
                    <div>
                      <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          id="customAmount"
                          name="customAmount"
                          min="1"
                          step="0.01"
                          value={formData.customAmount}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Donor Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="donorName"
                      name="donorName"
                      required
                      value={formData.donorName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="donorEmail"
                      name="donorEmail"
                      required
                      value={formData.donorEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">
                    Make this donation anonymous
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || getDonationAmount() < 1}
                  className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure payment powered by Stripe
                </div>
              </form>
            </div>

            {/* Impact Information */}
            <div className="space-y-8">
              <div className="bg-blue-50 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Impact</h3>
                <div className="space-y-4">
                  {impactStats.map((stat, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">{stat.amount}</div>
                        <div className="text-gray-700">{stat.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Why Donate?</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>85% of donations go directly to programs</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Tax-deductible in the United States</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Transparent reporting on fund usage</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Immediate impact in communities</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">1,250</div>
                    <div className="text-sm text-gray-600">Children educated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">45</div>
                    <div className="text-sm text-gray-600">Wells built</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">8,500</div>
                    <div className="text-sm text-gray-600">Medical treatments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">320</div>
                    <div className="text-sm text-gray-600">Homes built</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
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
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
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