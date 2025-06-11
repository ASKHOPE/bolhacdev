import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Heart, Droplets, Home, Users, Lightbulb, ArrowRight } from 'lucide-react'

export function Programs() {
  const programs = [
    {
      id: 'education',
      icon: BookOpen,
      title: 'Education Initiative',
      description: 'Providing quality education and learning resources to underserved communities worldwide.',
      image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800',
      stats: { beneficiaries: '15,000+', locations: '12 countries', duration: '5 years' },
      details: [
        'Building and renovating schools in remote areas',
        'Training local teachers and providing educational materials',
        'Scholarship programs for underprivileged students',
        'Adult literacy programs for community development',
      ],
      color: 'blue',
    },
    {
      id: 'healthcare',
      icon: Heart,
      title: 'Healthcare Access',
      description: 'Ensuring basic healthcare services reach remote and marginalized communities.',
      image: 'https://images.pexels.com/photos/6303773/pexels-photo-6303773.jpeg?auto=compress&cs=tinysrgb&w=800',
      stats: { beneficiaries: '25,000+', locations: '8 countries', duration: '7 years' },
      details: [
        'Mobile health clinics for remote communities',
        'Training community health workers',
        'Maternal and child health programs',
        'Disease prevention and health education campaigns',
      ],
      color: 'red',
    },
    {
      id: 'clean-water',
      icon: Droplets,
      title: 'Clean Water Project',
      description: 'Building sustainable water systems and sanitation facilities for communities in need.',
      image: 'https://images.pexels.com/photos/6962024/pexels-photo-6962024.jpeg?auto=compress&cs=tinysrgb&w=800',
      stats: { beneficiaries: '8,000+', locations: '6 countries', duration: '4 years' },
      details: [
        'Drilling wells and installing water pumps',
        'Building water treatment facilities',
        'Constructing sanitation systems',
        'Training communities in water system maintenance',
      ],
      color: 'cyan',
    },
    {
      id: 'housing',
      icon: Home,
      title: 'Housing Development',
      description: 'Providing safe, affordable housing solutions for families in crisis.',
      image: 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=800',
      stats: { beneficiaries: '2,500+', locations: '5 countries', duration: '3 years' },
      details: [
        'Building disaster-resistant homes',
        'Renovating existing housing structures',
        'Community-led construction training',
        'Sustainable building material sourcing',
      ],
      color: 'green',
    },
    {
      id: 'community-empowerment',
      icon: Users,
      title: 'Community Empowerment',
      description: 'Supporting local leadership and economic development initiatives.',
      image: 'https://images.pexels.com/photos/7551659/pexels-photo-7551659.jpeg?auto=compress&cs=tinysrgb&w=800',
      stats: { beneficiaries: '10,000+', locations: '15 countries', duration: '6 years' },
      details: [
        'Leadership training for community members',
        'Microfinance and small business support',
        'Cooperative development programs',
        'Women\'s empowerment initiatives',
      ],
      color: 'purple',
    },
    {
      id: 'innovation',
      icon: Lightbulb,
      title: 'Innovation Lab',
      description: 'Developing technology solutions for humanitarian challenges.',
      image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      stats: { beneficiaries: '5,000+', locations: '10 countries', duration: '2 years' },
      details: [
        'Solar energy solutions for remote areas',
        'Mobile technology for education and health',
        'Agricultural technology innovations',
        'Digital literacy programs',
      ],
      color: 'yellow',
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      red: 'bg-red-100 text-red-600',
      cyan: 'bg-cyan-100 text-cyan-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
    }
    return colors[color as keyof typeof colors] || 'bg-blue-100 text-blue-600'
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Programs</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100">
              Comprehensive initiatives designed to create lasting change and empower communities worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="relative">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getColorClasses(program.color)}`}>
                      <program.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {program.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-bold text-gray-900">
                        {program.stats.beneficiaries}
                      </div>
                      <div className="text-xs text-gray-600">Beneficiaries</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-bold text-gray-900">
                        {program.stats.locations}
                      </div>
                      <div className="text-xs text-gray-600">Locations</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-bold text-gray-900">
                        {program.stats.duration}
                      </div>
                      <div className="text-xs text-gray-600">Active</div>
                    </div>
                  </div>

                  {/* Key Features */}
                  <ul className="space-y-1 mb-6">
                    {program.details.slice(0, 2).map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex space-x-3">
                    <Link
                      to={`/programs/${program.id}`}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Projects
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                    <Link
                      to={`/donate?program=${program.id}`}
                      className="flex items-center justify-center px-4 py-2 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Want to Support Our Programs?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your contribution can make a real difference in the lives of thousands of people. 
            Join us in creating sustainable change that lasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/donate"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Donate Now
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}