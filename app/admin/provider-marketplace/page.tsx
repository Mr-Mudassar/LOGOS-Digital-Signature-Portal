'use client'

import { Store, Search, Star, TrendingUp, Award, Users } from 'lucide-react'

export default function ProviderMarketplacePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Store className="w-8 h-8 text-primary" />
          Provider Marketplace
        </h1>
        <p className="text-gray-600 mt-2">Discover and connect with verified service providers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Providers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">248</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Verified providers</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">4.7</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Out of 5 stars</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Rated</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">42</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">5-star providers</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">189</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Active providers</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search providers by name, service, or location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            disabled
          >
            <option>All Categories</option>
            <option>Legal Services</option>
            <option>Documentation</option>
            <option>Notary Services</option>
            <option>Translation</option>
          </select>
          <select
            className="border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            disabled
          >
            <option>All Ratings</option>
            <option>5 Stars</option>
            <option>4+ Stars</option>
            <option>3+ Stars</option>
          </select>
        </div>
      </div>

      {/* Provider Grid - Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <Store className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Provider Marketplace</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            This feature is currently under development. Soon you&apos;ll be able to browse,
            compare, and connect with verified service providers in one centralized marketplace.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-lg text-gray-700">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
