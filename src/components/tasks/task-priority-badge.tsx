import { Badge } from "@/components/ui/badge"
import { TaskPriority } from "@prisma/client"
import { AlertCircle, ArrowUp, ArrowRight, ArrowDown } from "lucide-react"

const priorityConfig = {
  LOW: { label: 'Low', className: 'bg-gray-100 text-gray-700', icon: ArrowDown },
  MEDIUM: { label: 'Medium', className: 'bg-blue-100 text-blue-700', icon: ArrowRight },
  HIGH: { label: 'High', className: 'bg-orange-100 text-orange-700', icon: ArrowUp },
  URGENT: { label: 'Urgent', className: 'bg-red-100 text-red-700', icon: AlertCircle },
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority]
  const Icon = config.icon

  return (
    <Badge variant="secondary" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}
