import { getClients } from "@/actions/clients"
import { ClientDialog } from "@/components/clients/client-dialog"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { UserPlus } from "lucide-react"
import Link from "next/link"

export default async function ClientsPage() {
    const clients = await getClients()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your client accounts and project access
                    </p>
                </div>
                <ClientDialog />
            </div>

            {clients.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
                        <p className="text-muted-foreground text-center max-w-sm mb-4">
                            Add your first client to enable project portal access. Each client gets one project automatically.
                        </p>
                        <ClientDialog />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                        <Link key={client.id} href={`/admin/projects/${client.projects?.[0]?.id || '#'}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle>{client.name}</CardTitle>
                                    <CardDescription>{client.email}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Project</span>
                                            <span className="font-medium">{client.projects?.[0]?.name || 'None'}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Created {new Date(client.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
