export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/contracts/:path*', '/sign/:path*', '/admin/:path*'],
}
