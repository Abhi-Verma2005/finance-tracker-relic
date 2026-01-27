import { TasksTab } from "@/components/projects/tasks-tab"
import { getProjectModules } from "@/actions/modules"
import { getEmployees } from "@/actions/employees"

export default async function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [modules, employees] = await Promise.all([
    getProjectModules(id),
    getEmployees()
  ])
  
  return (
    <div className="h-full">
      <TasksTab 
        projectId={id} 
        modules={modules}
        employees={employees}
      />
    </div> 
  )
}
