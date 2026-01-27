import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { authConfig } from "@/lib/auth.config"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          // First check User table (Admins)
          const user = await db.user.findUnique({
            where: { email },
            include: { company: true },
          })

          if (user && user.password) {
            const passwordsMatch = await bcrypt.compare(password, user.password)
            if (passwordsMatch) {
              return {
                id: user.id,
                name: user.name || undefined,
                email: user.email,
                companyId: user.companyId || undefined,
                userType: 'ADMIN' as const,
                employeeId: user.employeeId || undefined,
              }
            }
          }

          // Then check Employee table
          const employee = await db.employee.findUnique({
            where: { email },
            include: { company: true },
          })

          if (employee && employee.password) {
            const passwordsMatch = await bcrypt.compare(password, employee.password)
            if (passwordsMatch) {
              return {
                id: employee.id,
                name: employee.name,
                email: employee.email || email,
                companyId: employee.companyId,
                userType: 'EMPLOYEE' as const,
                employeeId: employee.id,
              }
            }
          }

          // Finally check Client table
          const client = await db.client.findUnique({
            where: { email },
            include: { company: true },
          })

          if (client && client.password) {
            const passwordsMatch = await bcrypt.compare(password, client.password)
            if (passwordsMatch) {
              return {
                id: client.id,
                name: client.name,
                email: client.email,
                companyId: client.companyId,
                userType: 'CLIENT' as const,
              }
            }
          }
        }

        return null
      },
    }),
  ],
})
