import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DollarSign, Calendar } from "lucide-react"
import { redirect } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function EmployeePaymentsPage() {
  const session = await auth()
  const employeeId = session?.user?.employeeId

  if (!employeeId) {
    redirect("/login")
  }

  const payments = await db.expenditure.findMany({
    where: { employeeId },
    include: { account: true },
    orderBy: { date: 'desc' },
  })

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground mt-1">
          View all your payment records
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {payments.length} {payments.length === 1 ? 'payment' : 'payments'} total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <DollarSign className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Your payment history will appear here once payments are recorded
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(payment.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.description}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.account.name}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${payment.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
