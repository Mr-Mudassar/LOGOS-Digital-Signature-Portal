import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        loginAsAdmin: { label: 'Login as Admin', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        // Check loginAsAdmin flag
        const loginAsAdmin = credentials.loginAsAdmin === 'true'

        if (loginAsAdmin) {
          // User checked "Login as Admin" - only allow if user is actually an admin
          if (user.role !== 'ADMIN') {
            throw new Error('You are not authorized to login as an admin')
          }
        } else {
          // User did NOT check "Login as Admin" - only allow regular users
          if (user.role === 'ADMIN') {
            throw new Error('Admin users must check "Login as Admin" to sign in')
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lasrraNumber: user.lasrraNumber ?? undefined,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.lasrraNumber = user.lasrraNumber
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.lasrraNumber = token.lasrraNumber as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
