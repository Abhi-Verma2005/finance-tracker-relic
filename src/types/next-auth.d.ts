import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      companyId: string
      userType: 'ADMIN' | 'EMPLOYEE'
      employeeId?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    name?: string
    companyId?: string | null
    userType: 'ADMIN' | 'EMPLOYEE'
    employeeId?: string
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string
    companyId: string
    userType: 'ADMIN' | 'EMPLOYEE'
    employeeId?: string
  }
}
