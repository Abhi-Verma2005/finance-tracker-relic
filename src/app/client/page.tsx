import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectStatusBadge } from '@/components/projects/project-status-badge'

export default async function ClientDashboardPage() {
    const session = await auth()

    if (!session || session.user.userType !== 'CLIENT') {
        redirect('/client/login')
    }

    // Get client's projects
    const client = await db.client.findUnique({
        where: { id: session.user.id },
        include: {
            projects: {
                include: {
                    tasks: true,
                    documents: true,
                },
            },
        },
    })

    if (!client) {
        redirect('/client/login')
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Welcome, {client.name}</h1>
                    <p className="text-muted-foreground mt-1">Your Projects</p>
                </div>

                {client.projects.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No projects assigned yet
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {client.projects.map((project) => (
                            <Link key={project.id} href={`/client/${project.id}`}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{project.name}</CardTitle>
                                            <ProjectStatusBadge status={project.status} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tasks</span>
                                                <span className="font-medium">{project.tasks.length}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Documents</span>
                                                <span className="font-medium">{project.documents.length}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
