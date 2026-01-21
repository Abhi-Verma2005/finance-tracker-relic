"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TaskForm } from "@/components/forms/task-form"
import { useState } from "react"
import { Plus } from "lucide-react"

interface TaskDialogProps {
  task?: any
  projectId: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TaskDialog({ task, projectId, trigger, open, onOpenChange }: TaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = open !== undefined
  const show = isControlled ? open : internalOpen
  const setShow = isControlled ? onOpenChange! : setInternalOpen

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update task details" : "Add a new task to this project"}
          </DialogDescription>
        </DialogHeader>
        <TaskForm task={task} projectId={projectId} onSuccess={() => setShow(false)} />
      </DialogContent>
    </Dialog>
  )
}
