'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
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

  const isAdmin = session?.user?.role === 'ADMIN'

  const handleSignOut = async () => {
    try {
      toast.success('Signed out successfully!')
      await signOut({ callbackUrl: '/auth/signin' })
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  // Admin navigation - Dashboard, All Contracts, and MDA
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'All Contracts', href: '/admin/all-contracts', icon: FileText },
    { name: 'MDA', href: '/admin/mda', icon: Building2 },
  ]

  // User navigation - Dashboard, My Contracts, Pending Signature
  const userNavigation = [
    { name: 'Dashboard', href: '/user/dashboard', icon: BarChart3 },
    { name: 'My Contracts', href: '/user/all-contracts', icon: LayoutDashboard },
    { name: 'Pending Signature', href: '/user/pending-signature', icon: FileText },
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
