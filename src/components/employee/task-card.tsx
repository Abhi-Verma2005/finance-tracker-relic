"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { TaskStatusBadge } from "@/components/tasks/task-status-badge"
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge"
import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle } from "lucide-react"
import type { Task, Project } from "@prisma/client"
import { markTaskComplete } from "@/actions/employee-tasks"
import { toast } from "sonner"
import { useState } from "react"

type TaskWithProject = Task & {
  project: Project
}

export function EmployeeTaskCard({ task }: { task: TaskWithProject }) {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleComplete = async () => {
    if (task.status === 'COMPLETED') return

    setIsCompleting(true)
    try {
      const result = await markTaskComplete(task.id)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Task marked as complete")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              {task.project.name}
            </div>
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
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
        <CardFooter>
          <Button
            onClick={handleComplete}
            disabled={isCompleting}
            className="w-full"
            variant="default"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isCompleting ? "Completing..." : "Mark as Complete"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
