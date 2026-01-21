import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RootPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Redirect based on user type
  if (session.user.userType === "ADMIN") {
    redirect("/admin")
  } else if (session.user.userType === "EMPLOYEE") {
    redirect("/employee")
  }

  // Fallback
  redirect("/login")
}
