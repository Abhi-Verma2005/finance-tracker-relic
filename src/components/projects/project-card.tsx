import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ProjectStatusBadge } from "./project-status-badge"
import { Calendar, ListTodo } from "lucide-react"
import Link from "next/link"
import type { Project, Task } from "@prisma/client"

type ProjectWithTasks = Project & {
  tasks: Task[]
}

export function ProjectCard({ project }: { project: ProjectWithTasks }) {
  const taskStats = {
    total: project.tasks.length,
    completed: project.tasks.filter(t => t.status === 'COMPLETED').length,
    inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
  }

  return (
    <Link href={`/admin/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-xl">{project.name}</CardTitle>
              {project.description && (
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              )}
            </div>
            <ProjectStatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              <span>
                {taskStats.completed}/{taskStats.total} tasks
              </span>
            </div>
            {project.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
