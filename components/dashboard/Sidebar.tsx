'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  Shield,
  LayoutDashboard,
  FileText,
  LogOut,
  Search,
  BarChart3,
  Building2,
  ShieldCheck,
  User,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Role-based check within the component
  const isAdmin = session?.user?.role === 'ADMIN'

  const handleSignOut = async () => {
    try {
      toast.success('Signed out successfully!')
      await signOut({ callbackUrl: '/auth/signin' })
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  // Admin navigation
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'MDA', href: '/admin/mda', icon: Building2 },
    { name: 'Provider Marketplace', href: '/admin/provider-marketplace', icon: ShieldCheck },
    { name: 'Verification Portal', href: '/admin/verification-portal', icon: Search },
    { name: 'Admin Console', href: '/admin/console', icon: Shield },
  ]

  // User navigation
  const userNavigation = [
    { name: 'My Contracts', href: '/user/all-contracts', icon: LayoutDashboard },
    { name: 'Create Contract', href: '/user/create-contract', icon: FileText },
    { name: 'Pending Signature', href: '/user/pending-signature', icon: ShieldCheck },
  ]

  // Choose navigation based on role
  const navigation = isAdmin ? adminNavigation : userNavigation

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-2 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <Image src="/lagos2.jpg" alt="Lagos State" fill className="object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Lagos State</h1>
            <p className="font-bold text-gray-900">Digital Signature Portal</p>
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
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* User Identity */}
        {session?.user && (
          <div className="px-4 py-3 bg-gray-50 rounded-lg">
            {/* Role Badge with Icon */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                  isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {session.user.role || 'USER'}
              </span>
            </div>
            {/* Name and Email */}
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 w-full transition-colors">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to the sign-in page and will need to log in again to access
                your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
