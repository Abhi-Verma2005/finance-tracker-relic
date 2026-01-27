import { getProjectById } from "@/actions/projects"
import { CommentsTab } from "@/components/projects/comments-tab"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function ProjectCommentsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const project = await getProjectById(id)
  const session = await auth()

  if (!project) notFound()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Comments</h2>
      <CommentsTab
        projectId={id}
        comments={project.comments || []}
        userId={session?.user?.id}
        userType={session?.user?.userType}
      />
    </div>
  )
}
