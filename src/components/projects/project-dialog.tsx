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
import { ProjectForm } from "@/components/forms/project-form"
import { useState } from "react"
import { Plus } from "lucide-react"

interface ProjectDialogProps {
  project?: any
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProjectDialog({ project, trigger, open, onOpenChange }: ProjectDialogProps) {
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
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create Project"}</DialogTitle>
          <DialogDescription>
            {project ? "Update project details" : "Add a new project to track"}
          </DialogDescription>
        </DialogHeader>
        <ProjectForm project={project} onSuccess={() => setShow(false)} />
      </DialogContent>
    </Dialog>
  )
}
