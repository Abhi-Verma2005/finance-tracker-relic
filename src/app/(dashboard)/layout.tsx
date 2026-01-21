import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Wallet, Receipt, Tags, LogOut, TrendingUp, ListFilter, Users, FolderTree, BarChart3, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <aside className="w-full md:w-64 border-r border-border p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Finance Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{session.user?.name}</p>
          <p className="text-xs text-muted-foreground/70">{session.user?.email}</p>
        </div>

        <nav className="flex-1 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link href="/accounts" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
            <Wallet className="h-4 w-4" />
            <span>Accounts</span>
          </Link>
          <Link href="/employees" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
            <Users className="h-4 w-4" />
            <span>Employees</span>
          </Link>
          <Link href="/expenditures" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
            <Receipt className="h-4 w-4" />
            <span>Expenditures</span>
          </Link>
          <Link href="/incomes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
            <TrendingUp className="h-4 w-4" />
            <span>Income</span>
          </Link>
          <Link href="/transactions" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
            <ListFilter className="h-4 w-4" />
            <span>Transactions</span>
          </Link>
          <Link href="/categories" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
            <FolderTree className="h-4 w-4" />
            <span>Categories</span>
          </Link>
          <Link href="/tags" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
            <Tags className="h-4 w-4" />
            <span>Tags</span>
          </Link>
          <Link href="/recurring-transactions" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
            <Repeat className="h-4 w-4" />
            <span>Recurring</span>
          </Link>
          <Link href="/reports" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
            <BarChart3 className="h-4 w-4" />
            <span>Reports</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t">
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
