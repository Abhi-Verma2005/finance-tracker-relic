import { getClients } from "@/actions/clients"
import { ProjectWizard } from "@/components/projects/project-wizard"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewProjectPage() {
  const clients = await getClients()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground mt-1">
            Set up a new project with client and tracking details
          </p>
        </div>
      </div>

      <ProjectWizard clients={clients} />
    </div>
  )
}
