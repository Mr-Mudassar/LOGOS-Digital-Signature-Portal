'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    // Redirect admin users to admin dashboard
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin/stats')
    }
  }, [status, session, router])

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render user content for admin users
  if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
    return null
  }

  return <>{children}</>
}
