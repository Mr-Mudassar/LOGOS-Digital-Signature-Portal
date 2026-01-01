import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Redirect admin users trying to access user routes
    if (path.startsWith('/user') && token?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    // Redirect regular users trying to access admin routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/user/all-contracts', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/user/:path*', '/admin/:path*', '/contracts/:path*'],
}
