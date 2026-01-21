import { Badge } from "@/components/ui/badge"
import { TaskStatus } from "@prisma/client"

const statusConfig = {
  TODO: { label: 'To Do', className: 'bg-slate-100 text-slate-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  IN_REVIEW: { label: 'In Review', className: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status]

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}
