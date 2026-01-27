import { getProjectById } from "@/actions/projects"
import { DocumentsTab } from "@/components/projects/documents-tab"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function ProjectDocumentsPage({ 
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
      <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
      <DocumentsTab
        projectId={id}
        documents={project.documents || []}
        userId={session?.user?.id}
      />
    </div>
  )
}
