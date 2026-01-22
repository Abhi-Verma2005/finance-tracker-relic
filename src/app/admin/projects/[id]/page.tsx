import { getProjectById } from "@/actions/projects"
import { ProjectStatusBadge } from "@/components/projects/project-status-badge"
import { ProjectDialog } from "@/components/projects/project-dialog"
import { DocumentsTab } from "@/components/projects/documents-tab"
import { ProgressTab } from "@/components/projects/progress-tab"
import { FinancesTab } from "@/components/projects/finances-tab"
import { CommentsTab } from "@/components/projects/comments-tab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Edit, ArrowLeft, FileText, BarChart3, Users, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectById(id)
  const session = await auth()

  if (!project) {
    notFound()
  }

  // Get finances from tag
  const tagIncomes = project.tag ? await db.income.findMany({
    where: { tags: { some: { tagId: project.tag.id } } },
    orderBy: { date: 'desc' },
  }) : []

  const tagExpenditures = project.tag ? await db.expenditure.findMany({
    where: { tags: { some: { tagId: project.tag.id } } },
    include: { employee: true },
    orderBy: { date: 'desc' },
  }) : []

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
            {project.hasUpworkTimesheet && (
              <a
                href={project.upworkContractUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Upwork ↗
              </a>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
          {project.client && (
            <p className="text-sm text-muted-foreground mt-1">
              Client: {project.client.name}
            </p>
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="finances" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Finances
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-card rounded-lg border p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
                <p className="text-2xl font-bold">{project.tasks?.length || 0}</p>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Team Members</h3>
                <p className="text-2xl font-bold">{project.projectEmployees?.length || 0}</p>
              </div>
              <div className="bg-card rounded-lg border p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Documents</h3>
                <p className="text-2xl font-bold">{project.documents?.length || 0}</p>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {project.dailyLogs?.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground whitespace-nowrap">
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                    <span>{log.employee.name}</span>
                    <span className="text-muted-foreground">{log.description}</span>
                  </div>
                ))}
                {(!project.dailyLogs || project.dailyLogs.length === 0) && (
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentsTab
            projectId={id}
            documents={project.documents || []}
            userId={session?.user?.id}
          />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <ProgressTab
            dailyLogs={project.dailyLogs || []}
            modules={project.modules || []}
          />
        </TabsContent>

        <TabsContent value="finances" className="mt-6">
          <FinancesTab
            tag={project.tag}
            incomes={tagIncomes}
            expenditures={tagExpenditures}
          />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Team</h3>
            {project.projectEmployees?.map((pe) => (
              <div key={pe.id} className="bg-card rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{pe.employee.name}</p>
                    <p className="text-sm text-muted-foreground">{pe.role}</p>
                  </div>
                  <Button variant="ghost" size="sm">Remove</Button>
                </div>
              </div>
            ))}
            {(!project.projectEmployees || project.projectEmployees.length === 0) && (
              <p className="text-muted-foreground">No team members assigned</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <CommentsTab
            projectId={id}
            comments={project.comments || []}
            userId={session?.user?.id}
            userType={session?.user?.userType}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

