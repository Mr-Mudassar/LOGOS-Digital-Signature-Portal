'use client'

import { Settings } from 'lucide-react'

export default function AdminConsolePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Admin Console
        </h1>
        <p className="text-gray-600 mt-2">
          Manage users, providers, and monitor the Lagos digital signature ecosystem.
        </p>
      </div>

      {/* Three Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Manage Users */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Manage Users</h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure admin roles, permissions and access policies.
          </p>
          <a
            href="#"
            className="text-teal-600 hover:text-teal-700 font-medium text-sm hover:underline"
          >
            Open user management
          </a>
        </div>

        {/* Card 2: Provider Accreditation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Provider Accreditation</h3>
          <p className="text-sm text-gray-600 mb-6">
            Approve, monitor and revoke certified signature providers.
          </p>
          <a
            href="#"
            className="text-teal-600 hover:text-teal-700 font-medium text-sm hover:underline"
          >
            View providers
          </a>
        </div>

        {/* Card 3: Analytics Dashboard */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Analytics Dashboard</h3>
          <p className="text-sm text-gray-600 mb-6">
            Monitor volume, anomalies and enforcement indicators.
          </p>
          <a
            href="#"
            className="text-teal-600 hover:text-teal-700 font-medium text-sm hover:underline"
          >
            Open analytics
          </a>
        </div>
      </div>
    </div>
  )
}
