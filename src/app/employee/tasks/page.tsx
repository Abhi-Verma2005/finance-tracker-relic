import { getEmployeeTasks } from "@/actions/employee-tasks"
import { EmployeeTaskCard } from "@/components/employee/task-card"
import { ListTodo } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function EmployeeTasksPage() {
  const tasks = await getEmployeeTasks()

  const tasksByStatus = {
    active: tasks.filter(t => ['TODO', 'IN_PROGRESS', 'IN_REVIEW'].includes(t.status)),
    completed: tasks.filter(t => t.status === 'COMPLETED'),
    all: tasks,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your assigned tasks
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active ({tasksByStatus.active.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({tasksByStatus.completed.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({tasksByStatus.all.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {tasksByStatus.active.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <ListTodo className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No active tasks</h3>
              <p className="text-muted-foreground max-w-sm">
                You don't have any active tasks at the moment
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tasksByStatus.active.map((task) => (
                <EmployeeTaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {tasksByStatus.completed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <ListTodo className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No completed tasks</h3>
              <p className="text-muted-foreground max-w-sm">
                Completed tasks will appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tasksByStatus.completed.map((task) => (
                <EmployeeTaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {tasksByStatus.all.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <ListTodo className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tasks assigned</h3>
              <p className="text-muted-foreground max-w-sm">
                Tasks assigned to you will appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tasksByStatus.all.map((task) => (
                <EmployeeTaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
