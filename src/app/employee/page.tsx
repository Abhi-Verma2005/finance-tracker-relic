import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ListTodo, CheckCircle, Clock, DollarSign } from "lucide-react"
import { redirect } from "next/navigation"

export default async function EmployeeDashboard() {
  const session = await auth()
  const employeeId = session?.user?.employeeId

  if (!employeeId) {
    redirect("/login")
  }

  const [employee, tasks, payments] = await Promise.all([
    db.employee.findUnique({
      where: { id: employeeId },
    }),
    db.task.findMany({
      where: { assigneeId: employeeId },
      include: { project: true },
      orderBy: { dueDate: 'asc' },
    }),
    db.expenditure.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' },
      take: 5,
    }),
  ])

  if (!employee) {
    redirect("/login")
  }

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  }

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {employee.name}</h1>
        <p className="text-muted-foreground mt-1">
          {employee.role && `${employee.role}`}
          {employee.department && ` • ${employee.department}`}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.todo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded</p>
          ) : (
            <div className="space-y-3">
              {payments.map(payment => (
                <div key={payment.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="font-semibold flex items-center">
                    <DollarSign className="h-4 w-4" />
                    {payment.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
