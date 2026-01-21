import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmployeeDialog } from "@/components/employees/employee-dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, Calendar, Briefcase, Building, DollarSign, ListTodo, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  INACTIVE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  TERMINATED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
}

const typeLabels: Record<string, string> = {
  EMPLOYEE: "Employee",
  CONTRACTOR: "Contractor",
  VENDOR: "Vendor",
  FREELANCER: "Freelancer",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  const employee = await db.employee.findUnique({
    where: {
      id,
      companyId: session?.user?.companyId,
    },
    include: {
      expenditures: {
        include: {
          account: true,
          category: true,
          tags: { include: { tag: true } },
        },
        orderBy: { date: "desc" },
      },
      tasksAssigned: {
        include: {
          project: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!employee) {
    notFound()
  }

  const totalPaid = employee.expenditures.reduce((sum, e) => sum + e.amount, 0)
  const thisMonth = employee.expenditures.filter((e) => {
    const now = new Date()
    return (
      e.date.getMonth() === now.getMonth() &&
      e.date.getFullYear() === now.getFullYear()
    )
  })
  const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0)

  // Task statistics
  const taskStats = {
    total: employee.tasksAssigned.length,
    todo: employee.tasksAssigned.filter(t => t.status === 'TODO').length,
    inProgress: employee.tasksAssigned.filter(t => t.status === 'IN_PROGRESS').length,
    completed: employee.tasksAssigned.filter(t => t.status === 'COMPLETED').length,
    inReview: employee.tasksAssigned.filter(t => t.status === 'IN_REVIEW').length,
  }

  // Group tasks by status for tabs
  const tasksByStatus = {
    active: employee.tasksAssigned.filter(t => ['TODO', 'IN_PROGRESS', 'IN_REVIEW'].includes(t.status)),
    completed: employee.tasksAssigned.filter(t => t.status === 'COMPLETED'),
    all: employee.tasksAssigned,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{employee.name}</h1>
            <Badge
              variant="secondary"
              className={statusColors[employee.status]}
            >
              {employee.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {typeLabels[employee.employeeType]}
            {employee.role && ` - ${employee.role}`}
          </p>
        </div>
        <EmployeeDialog
          employee={employee}
          trigger={<Button variant="outline">Edit Employee</Button>}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisMonthTotal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {taskStats.completed} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tasks
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.inProgress + taskStats.todo}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {taskStats.todo} to do, {taskStats.inProgress} in progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employee.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{employee.phone}</span>
              </div>
            )}
            {employee.role && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{employee.role}</span>
              </div>
            )}
            {employee.department && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{employee.department}</span>
              </div>
            )}
            {employee.hireDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Hired {format(employee.hireDate, "PPP")}</span>
              </div>
            )}
            {employee.salary && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>${employee.salary.toLocaleString()}/month</span>
              </div>
            )}
            {employee.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">{employee.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.expenditures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No payments recorded for this employee.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  employee.expenditures.map((expenditure: any) => (
                    <TableRow key={expenditure.id}>
                      <TableCell>
                        {format(expenditure.date, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{expenditure.description}</TableCell>
                      <TableCell>{expenditure.account.name}</TableCell>
                      <TableCell>
                        {expenditure.category?.name || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${expenditure.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All ({tasksByStatus.all.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({tasksByStatus.active.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({tasksByStatus.completed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {tasksByStatus.all.length === 0 ? (
                <div className="text-center py-12">
                  <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks assigned</h3>
                  <p className="text-muted-foreground">
                    This employee has no tasks assigned yet.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasksByStatus.all.map((task: any) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/projects/${task.project.id}`} className="text-primary hover:underline">
                            {task.project.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <TaskPriorityBadge priority={task.priority} />
                        </TableCell>
                        <TableCell>
                          <TaskStatusBadge status={task.status} />
                        </TableCell>
                        <TableCell>
                          {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-4">
              {tasksByStatus.active.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active tasks</h3>
                  <p className="text-muted-foreground">
                    All tasks are completed or this employee has no active tasks.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasksByStatus.active.map((task: any) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/projects/${task.project.id}`} className="text-primary hover:underline">
                            {task.project.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <TaskPriorityBadge priority={task.priority} />
                        </TableCell>
                        <TableCell>
                          <TaskStatusBadge status={task.status} />
                        </TableCell>
                        <TableCell>
                          {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              {tasksByStatus.completed.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed tasks</h3>
                  <p className="text-muted-foreground">
                    Completed tasks will appear here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasksByStatus.completed.map((task: any) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/projects/${task.project.id}`} className="text-primary hover:underline">
                            {task.project.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <TaskPriorityBadge priority={task.priority} />
                        </TableCell>
                        <TableCell>
                          <TaskStatusBadge status={task.status} />
                        </TableCell>
                        <TableCell>
                          {task.completedAt ? format(new Date(task.completedAt), "MMM d, yyyy") : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
