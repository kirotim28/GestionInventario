import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        // Check if user is locked out
        if (user.bloqueado_hasta && user.bloqueado_hasta > new Date()) {
          throw new Error("Usuario bloqueado. Intente más tarde.")
        }

        // Check if user is suspended
        if (user.estado === "SUSPENDIDO") {
          throw new Error("Usuario suspendido. Contacte al administrador.")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Increment failed attempts
          const intentos = user.intentos_fallidos + 1
          const bloqueado = intentos >= 3 ? new Date(Date.now() + 60 * 60 * 1000) : null // 1 hour lockout

          await prisma.user.update({
            where: { id: user.id },
            data: {
              intentos_fallidos: intentos,
              bloqueado_hasta: bloqueado
            }
          })

          if (intentos >= 3) {
            throw new Error("Usuario bloqueado por 1 hora debido a múltiples intentos fallidos.")
          }

          return null
        }

        // Reset failed attempts on successful login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            intentos_fallidos: 0,
            bloqueado_hasta: null
          }
        })

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.nombre,
          role: user.rol
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as UserRole
        (session.user as any).id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET
}
