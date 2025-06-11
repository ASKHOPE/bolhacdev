import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Heart, Download, Share2 } from 'lucide-react'

export function DonationSuccess() {
  const [searchParams] = useSearchParams()
  const [donationDetails, setDonationDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (sessionId) {
      fetchDonationDetails()
    }
  }, [sessionId])

  const fetchDonationDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-donation-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()
      if (data.donation) {
        setDonationDetails(data.donation)
      }
    } catch (error) {
      console.error('Error fetching donation details:', error)
    } finally {
      setLoading(false)
    }
  }

  const shareMessage = `I just donated to HopeFoundation! Join me in making a difference. Every contribution helps create positive change in communities worldwide. 💙 #HopeFoundation #MakeADifference`

  const shareOnSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.origin)
    const text = encodeURIComponent(shareMessage)
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    }
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You for Your Donation!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your generosity will make a real difference in the lives of those we serve. 
            Together, we're creating positive change in communities worldwide.
          </p>
        </div>

        {/* Donation Details */}
        {donationDetails && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Donation Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donation Amount
                </label>
                <p className="text-2xl font-bold text-green-600">
                  ${(donationDetails.amount / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {donationDetails.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donor Name
                </label>
                <p className="text-gray-900">
                  {donationDetails.donor_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <p className="text-gray-900">
                  {new Date(donationDetails.created_at).toLocaleDateString()}
                </p>
              </div>
              {donationDetails.message && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {donationDetails.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Impact Information */}
        <div className="bg-blue-50 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Immediate Impact</h3>
              <p className="text-gray-600">
                Your donation will be put to work immediately in our active programs.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Programs</h3>
              <p className="text-gray-600">
                All our programs are regularly audited and verified for maximum impact.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                <Share2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparent Reporting</h3>
              <p className="text-gray-600">
                You'll receive updates on how your donation is making a difference.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Download Receipt</h3>
            <p className="text-gray-600 mb-4">
              Download your tax-deductible donation receipt for your records.
            </p>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Your Impact</h3>
            <p className="text-gray-600 mb-4">
              Inspire others to join our mission by sharing your donation.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => shareOnSocial('twitter')}
                className="px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
              >
                Twitter
              </button>
              <button
                onClick={() => shareOnSocial('facebook')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Facebook
              </button>
              <button
                onClick={() => shareOnSocial('linkedin')}
                className="px-3 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors text-sm"
              >
                LinkedIn
              </button>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Next?</h2>
          <p className="text-gray-600 mb-6">
            Stay connected with our mission and see the impact of your generosity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/programs"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Our Programs
            </Link>
            <Link
              to="/events"
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              Upcoming Events
            </Link>
            <Link
              to="/"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}