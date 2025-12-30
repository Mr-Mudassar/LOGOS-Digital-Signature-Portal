'use client'

import { Store, Search } from 'lucide-react'

const providers = [
  {
    id: 1,
    name: 'Lagos Default Provider',
    badge: 'Recommended',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    subtitle: 'State-backed',
    description: 'Official Lagos State signing engine for public services and regulated contracts.',
  },
  {
    id: 2,
    name: 'Certum Nigeria',
    badge: 'High Assurance',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    subtitle: 'Qualified Signature',
    description: 'Qualified digital certificates and signatures for high-assurance contracts.',
  },
  {
    id: 3,
    name: 'Tecres Digital Sign',
    badge: 'Enterprise',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    subtitle: 'Workflow Platform',
    description: 'Enterprise document management and e-signature workflows.',
  },
  {
    id: 4,
    name: 'Axendit Signature',
    badge: 'Finance',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    subtitle: 'Security & Trust',
    description: 'Security-focused certificates and trust services for banks and fintechs.',
  },
  {
    id: 5,
    name: 'Flowmono Sign',
    badge: 'SME',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    subtitle: 'SaaS E-Sign',
    description: 'Cloud-based e-sign for SMEs and distributed teams.',
  },
  {
    id: 6,
    name: 'Adobe Sign',
    badge: 'Global',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    subtitle: 'Global Platform',
    description: 'International e-signature service integrated with Adobe ecosystem.',
  },
]

export default function ProviderMarketplacePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            Provider Marketplace
          </h1>
          <p className="text-gray-600 mt-2">
            Choose a Lagos-certified signature provider for your workflows.
          </p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search providers"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{provider.subtitle}</p>
              </div>
              <span className={`${provider.badgeColor} px-3 py-1 rounded-full text-xs font-medium`}>
                {provider.badge}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{provider.description}</p>
            <button className="w-full bg-primary text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
              Select Provider
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
