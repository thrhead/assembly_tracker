import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/db"
import { loginSchema } from "@/lib/validations"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      phone?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    phone?: string | null
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Normalize email to lowercase
          const rawEmail = (credentials?.email as string || "").toLowerCase()
          const { email, password } = loginSchema.parse({
            ...credentials,
            email: rawEmail
          })
          console.log(`[Auth] Attempting login for: ${email}`)

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user) {
            console.log(`[Auth] User not found: ${email}`)
            return null
          }

          if (!user.isActive) {
            console.log(`[Auth] User found but inactive: ${email}`)
            return null
          }

          // Check if password hash is valid bcrypt format
          if (!user.passwordHash || !user.passwordHash.startsWith('$2')) {
             console.warn(`[Auth] Invalid password hash format for user: ${email}`)
             return null
          }

          const isPasswordValid = await compare(password, user.passwordHash)

          if (!isPasswordValid) {
            console.log(`[Auth] Invalid password for: ${email}`)
            return null
          }

          console.log(`[Auth] Login successful for: ${email} (${user.role})`)

          return {
            id: user.id,
            email: user.email,
            name: user.name || '',
            role: user.role,
            phone: user.phone,
          }
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string | null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "temp_secret_change_me_in_prod",
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
