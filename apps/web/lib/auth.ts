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
        console.log("Authorize attempt for:", credentials?.email);
        try {
          const { email, password } = loginSchema.parse(credentials);

          console.log("Searching user:", email);
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.log("User not found:", email);
            return null;
          }

          if (!user.isActive) {
            console.log("User is inactive:", email);
            return null;
          }

          console.log("Comparing password for:", email);
          const isPasswordValid = await compare(password, user.passwordHash);

          if (!isPasswordValid) {
            console.log("Invalid password for:", email);
            return null;
          }

          console.log("Auth success for:", email);
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
            phone: user.phone
          } as any;
        } catch (error) {
          console.error("Authorization error details:", error);
          return null;
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
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
