import { getProjectTimeline } from "@/actions/timeline"
import { notFound } from "next/navigation"
import { TimelineView } from "@/components/projects/timeline/timeline-view"
import { Separator } from "@/components/ui/separator"

export default async function ProjectProgressPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const { project, logs } = await getProjectTimeline(id)

  if (!project) notFound()

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Project Timeline</h2>
            <p className="text-muted-foreground">Track daily progress and milestone events.</p>
        </div>
        <Separator />
        
        <TimelineView 
            projectId={project.id}
            projectStartDate={project.startDate}
            logs={logs}
        />
    </div>
  )
}
