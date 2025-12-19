'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Shield,
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  Search,
  BarChart3,
  Building2,
  ShieldCheck,
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isAdmin = session?.user?.role === 'ADMIN'

  // Admin navigation - only Stats and MDA
  const adminNavigation = [
    { name: 'Stats', href: '/admin/stats', icon: BarChart3 },
    { name: 'MDA', href: '/admin/mda', icon: Building2 },
  ]

  // User navigation - Stats, My Contracts, Pending Signature
  const userNavigation = [
    { name: 'Stats', href: '/user/dashboard/stats', icon: BarChart3 },
    { name: 'My Contracts', href: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Pending Signature', href: '/user/dashboard/pending-signature', icon: FileText },
  ]

  // Choose navigation based on role
  const navigation = isAdmin ? adminNavigation : userNavigation

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Lagos State Digital</h1>
            <p className="text-xs text-gray-600">Signature Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-green-50 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
