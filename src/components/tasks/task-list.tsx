import { TaskCard } from "./task-card"
import type { Task, Employee } from "@prisma/client"
import { ListTodo } from "lucide-react"

type TaskWithAssignee = Task & {
  assignee: Employee | null
}

interface TaskListProps {
  tasks: TaskWithAssignee[]
  groupBy?: 'status' | 'priority' | 'none'
}

export function TaskList({ tasks, groupBy = 'none' }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <ListTodo className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Create your first task to get started
        </p>
      </div>
    )
  }

  if (groupBy === 'none') {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    )
  }

  if (groupBy === 'status') {
    const grouped = {
      TODO: tasks.filter(t => t.status === 'TODO'),
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
      IN_REVIEW: tasks.filter(t => t.status === 'IN_REVIEW'),
      COMPLETED: tasks.filter(t => t.status === 'COMPLETED'),
      CANCELLED: tasks.filter(t => t.status === 'CANCELLED'),
    }

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([status, statusTasks]) => {
          if (statusTasks.length === 0) return null

          const statusLabels: Record<string, string> = {
            TODO: 'To Do',
            IN_PROGRESS: 'In Progress',
            IN_REVIEW: 'In Review',
            COMPLETED: 'Completed',
            CANCELLED: 'Cancelled',
          }

          return (
            <div key={status}>
              <h3 className="text-lg font-semibold mb-3">
                {statusLabels[status]} ({statusTasks.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {statusTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return null
}
