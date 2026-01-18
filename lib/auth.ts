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

// Startup diagnostic
if (process.env.NODE_ENV === 'production') {
  console.log("Auth Initialization Diagnostic:", {
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasDbUrl: !!process.env.DATABASE_URL,
    hasDirectUrl: !!process.env.DIRECT_URL
  });
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
        // Runtime diagnostic
        console.log("Runtime Auth Check:", {
          hasAuthSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
          baseUrl: process.env.NEXTAUTH_URL || "not set",
          env: process.env.NODE_ENV
        });

        try {
          const { email, password } = loginSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user || !user.isActive) {
            return null
          }

          const isPasswordValid = await compare(password, user.passwordHash)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
            phone: user.phone
          } as any
        } catch (error) {
          console.error("Authorization error details:", {
            error,
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
          })
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
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  logger: {
    error(error) {
      console.error("NextAuth Error:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.log("NextAuth Debug:", { code, metadata });
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
