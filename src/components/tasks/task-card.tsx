import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { TaskStatusBadge } from "./task-status-badge"
import { TaskPriorityBadge } from "./task-priority-badge"
import { Calendar, User } from "lucide-react"
import type { Task, Employee } from "@prisma/client"

type TaskWithAssignee = Task & {
  assignee: Employee | null
}

export function TaskCard({ task }: { task: TaskWithAssignee }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base">{task.title}</CardTitle>
            {task.description && (
              <CardDescription className="line-clamp-2 text-sm">
                {task.description}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <TaskPriorityBadge priority={task.priority} />
            <TaskStatusBadge status={task.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {task.assignee && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{task.assignee.name}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
