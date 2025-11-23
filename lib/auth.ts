import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          throw new Error("Invalid credentials")
        }

        let user

        try {
          if (credentials.role === "student") {
            user = await prisma.student.findUnique({
              where: { email: credentials.email },
            })
          } else if (credentials.role === "faculty") {
            user = await prisma.faculty.findUnique({
              where: { email: credentials.email },
            })
          }

          if (!user || !user.password) {
            throw new Error("User not found")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("Invalid password")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: credentials.role,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
      // Redirect to dashboard after successful login
      if (url.startsWith(baseUrl)) return url;
      // If this is a callback from sign-in, redirect to dashboard
      if (url.startsWith('/api/auth/callback')) {
        return `${baseUrl}/dashboard`;
      }
      return baseUrl + (url.startsWith('/') ? url : `/${url}`);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
