import { getProjectById } from "@/actions/projects"
import { ProjectStatusBadge } from "@/components/projects/project-status-badge"
import { ProjectDialog } from "@/components/projects/project-dialog"
import { TaskDialog } from "@/components/tasks/task-dialog"
import { TaskList } from "@/components/tasks/task-list"
import { Button } from "@/components/ui/button"
import { Calendar, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <ProjectDialog project={project} trigger={
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        } />
      </div>

      {(project.startDate || project.endDate) && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {project.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Start: {new Date(project.startDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {project.endDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                End: {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Tasks</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {project.tasks.length} {project.tasks.length === 1 ? 'task' : 'tasks'} in this project
            </p>
          </div>
          <TaskDialog projectId={id} />
        </div>

        <TaskList tasks={project.tasks} groupBy="status" />
      </div>
    </div>
  )
}
