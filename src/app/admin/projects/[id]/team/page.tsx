import { getProjectById } from "@/actions/projects"
import { getProjectTeam } from "@/actions/project-employees"
import { getEmployees } from "@/actions/employees"
import { notFound } from "next/navigation"
import { TeamList } from "@/components/projects/team/team-list"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export default async function ProjectTeamPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const session = await auth()
  
  // Parallel data fetching
  const [project, projectTeam, allEmployees] = await Promise.all([
      db.project.findUnique({
          where: { id },
          select: { id: true, name: true, upworkContractUrl: true }
      }),
      getProjectTeam(id),
      db.employee.findMany({
          where: { companyId: session?.user?.companyId, status: "ACTIVE" },
          orderBy: { name: 'asc' }
      })
  ])

  if (!project) notFound()

  return (
    <div className="space-y-6">
       <div>
            <h2 className="text-2xl font-bold tracking-tight">Team & Assignees</h2>
            <p className="text-muted-foreground">Manage project members and view their workloads.</p>
       </div>
       
       <TeamList 
          projectId={project.id}
          projectTeam={projectTeam}
          allEmployees={allEmployees}
          upworkContractUrl={project.upworkContractUrl}
       />
    </div>
  )
}
